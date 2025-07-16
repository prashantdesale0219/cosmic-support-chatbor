const mistralService = require('./mistralService');
const configService = require('./configService');

class ChatService {
  constructor() {
    this.conversations = new Map();
    this.defaultLanguage = 'english';
  }

  /**
   * Process a chat message and generate a response
   * @param {String} message - The user's message
   * @param {String} conversationId - The conversation ID
   * @returns {Promise} - The chatbot response
   */
  async processMessage(message, conversationId) {
    try {
      // Get company data
      const companyData = configService.getCompanyData();
      
      // Get or create conversation history
      let conversationHistory = [];
      if (conversationId && this.conversations.has(conversationId)) {
        conversationHistory = this.conversations.get(conversationId);
      }
      
      // Set default language to English if it's a new conversation
      if (conversationHistory.length === 0) {
        this.defaultLanguage = 'english';
      }
      
      // Process the message using Mistral service
      const response = await mistralService.processChatMessage(
        message,
        conversationHistory,
        companyData
      );
      
      // Generate a new conversation ID if not provided
      if (!conversationId) {
        conversationId = this.generateConversationId();
      }
      
      // Update conversation history
      this.conversations.set(conversationId, response.conversationHistory);
      
      return {
        message: response.message,
        conversationId
      };
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      // Enhance error with additional context if it doesn't already have it
      if (!error.code) {
        error.code = 'CHAT_PROCESSING_ERROR';
      }
      
      if (!error.userFriendlyMessage) {
        error.userFriendlyMessage = 'Sorry, I encountered an issue while processing your message. Please try again later.';
      }
      
      // Log detailed error information for debugging
      console.error('Detailed error information:');
      console.error(`- Error code: ${error.code}`);
      console.error(`- Error message: ${error.message}`);
      console.error(`- User friendly message: ${error.userFriendlyMessage}`);
      
      throw error;
    }
  }

  /**
   * Calculate ROI based on user inputs
   * @param {Number} monthlyBill - User's monthly electricity bill
   * @param {String} state - User's state for subsidy calculation
   * @returns {Object} - ROI calculation results
   */
  calculateROI(monthlyBill, state) {
    try {
      const companyData = configService.getCompanyData();
      return mistralService.calculateROI(monthlyBill, state, companyData);
    } catch (error) {
      console.error('Error calculating ROI:', error);
      throw error;
    }
  }

  /**
   * Generate a unique conversation ID
   * @returns {String} - The generated conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get conversation history for a specific conversation ID
   * @param {String} conversationId - The conversation ID
   * @returns {Array} - The conversation history
   */
  getConversationHistory(conversationId) {
    if (!conversationId || !this.conversations.has(conversationId)) {
      return [];
    }
    return this.conversations.get(conversationId);
  }

  /**
   * Clear conversation history for a specific conversation ID
   * @param {String} conversationId - The conversation ID
   * @returns {Boolean} - Success status
   */
  clearConversation(conversationId) {
    if (!conversationId || !this.conversations.has(conversationId)) {
      return false;
    }
    return this.conversations.delete(conversationId);
  }
}

module.exports = new ChatService();