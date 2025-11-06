import {
  AutoModelForCausalLM,
  AutoTokenizer,
  env,
} from "@huggingface/transformers";
import {
  cleanSuggestion,
  extractCodeFromResponse,
} from "./src/cleanSuggestion.js";
import {
  createSuggestionElement,
  showSuggestion,
  hideSuggestion,
} from "./src/suggestionUI.js";

const MODEL_ID = "onnx-community/granite-4.0-1b-ONNX-web";

// Enable WebGPU and browser cache
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency ?? 4;
env.useBrowserCache = true;
env.allowRemoteModels = true; // pull once from the Hub

let model = null;
let tokenizer = null;
let typingTimeout = null;
let isGenerating = false;

// Initialize the model and tokenizer
async function loadModel() {
  try {
    tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
    model = await AutoModelForCausalLM.from_pretrained(MODEL_ID, {
      dtype: "q4",
      device: "webgpu",
    });
    return true;
  } catch (error) {
    console.error("Error loading model:", error);
    return false;
  }
}

const longTextInput = document.getElementById("long-text-input");
const loadingIndicator = document.getElementById("loading-indicator");
const suggestionElement = createSuggestionElement();

// Generate code suggestion
async function generateCodeSuggestion(input) {
  if (!model || !tokenizer || isGenerating) {
    return null;
  }

  isGenerating = true;

  try {
    // Create messages for code completion
    const messages = [
      {
        role: "user",
        content: `
        Your are a code completion AI assistant. \n
        INPUT: \`\`\`javascript\n${input}\n<|code|>\`\`\`
        Complete this JavaScript code with the most likely next lines of code in the <|code|> section. \n
        Pay attention to closing tags, opening tags, indentation, syntax and code quality. \n
        IMPORTANT: Only output the next lines of code to replace the <|code|> section. \n
        IMPORTANT: Do not output the INPUT part. Only the <|code|> section. \n
        IMPORTANT: Do not include comments in the code.\n`,
      },
    ];

    // Apply chat template to format the input properly
    const chatInput = tokenizer.apply_chat_template(messages, {
      add_generation_prompt: true,
      return_dict: true,
    });

    // Generate response using the model
    const { sequences } = await model.generate({
      ...chatInput,
      max_new_tokens: 128,
      do_sample: true,
      temperature: 1,
      return_dict_in_generate: true,
    });

    // Decode the generated text
    const response = tokenizer.batch_decode(
      sequences.slice(null, [chatInput.input_ids.dims[1], null]),
      { skip_special_tokens: true }
    )[0];

    // Extract code from response and clean it
    const rawSuggestion = extractCodeFromResponse(response);

    // Clean up suggestion by removing duplicate parts
    return cleanSuggestion(rawSuggestion, input);
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return null;
  } finally {
    isGenerating = false;
  }
}

// Initialize everything when the page loads
async function initializeApp() {
  loadingIndicator.style.display = "flex";
  const success = await loadModel();
  loadingIndicator.style.display = "none";

  if (success) {
    setupAutoCompletion();
  } else {
    loadingIndicator.textContent = "Failed to load model";
    loadingIndicator.style.display = "flex";
    loadingIndicator.style.borderLeftColor = "#f44336";
    loadingIndicator.style.color = "#f44336";
  }
}

// Setup auto-completion functionality
function setupAutoCompletion() {
  let currentSuggestion = null;

  // Handle typing in textarea
  longTextInput.addEventListener("input", () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    hideSuggestion(suggestionElement);
    currentSuggestion = null;

    typingTimeout = setTimeout(async () => {
      const input = longTextInput.value.trim();

      if (input.length > 0) {
        const suggestion = await generateCodeSuggestion(input);
        if (suggestion && suggestion !== input) {
          currentSuggestion = suggestion;
          showSuggestion(suggestion, longTextInput, suggestionElement);
        }
      }
    }, 1000);
  });

  // Handle Tab key to accept suggestion
  longTextInput.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && currentSuggestion) {
      e.preventDefault();

      const currentValue = longTextInput.value;
      const newValue =
        currentValue +
        (currentValue.endsWith("\n") ? "" : "\n") +
        currentSuggestion;
      longTextInput.value = newValue;

      hideSuggestion(suggestionElement);
      currentSuggestion = null;

      longTextInput.focus();
      longTextInput.setSelectionRange(newValue.length, newValue.length);
    }

    if (e.key === "Escape") {
      hideSuggestion(suggestionElement);
      currentSuggestion = null;
    }
  });

  // Hide suggestion when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target !== longTextInput) {
      hideSuggestion(suggestionElement);
      currentSuggestion = null;
    }
  });
}

initializeApp();
