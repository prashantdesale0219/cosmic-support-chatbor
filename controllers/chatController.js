const chatService = require('../services/chatService');

/**
 * Process a chat message and return a response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const response = await chatService.processMessage(message, conversationId);
    
    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error in processMessage controller:', error);
    
    // Determine the appropriate status code based on the error
    let statusCode = 500;
    let errorMessage = 'Error processing message';
    
    // Check for specific error codes from WhatsApp service
    if (error.code === 'ENV_VAR_MISSING') {
      statusCode = 503; // Service Unavailable
      errorMessage = 'WhatsApp service configuration error';
    } else if (error.code === 'TOKEN_EXPIRED') {
      statusCode = 401; // Unauthorized
      errorMessage = 'WhatsApp authentication error';
    } else if (error.code === 'API_ERROR') {
      statusCode = 502; // Bad Gateway
      errorMessage = 'WhatsApp API error';
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      userFriendlyMessage: error.userFriendlyMessage || 'An error occurred while processing your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Calculate ROI based on user inputs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.calculateROI = async (req, res) => {
  try {
    const { monthlyBill, state } = req.body;
    
    if (!monthlyBill) {
      return res.status(400).json({
        success: false,
        message: 'Monthly bill is required'
      });
    }
    
    const roiData = chatService.calculateROI(monthlyBill, state);
    
    return res.status(200).json({
      success: true,
      data: roiData
    });
  } catch (error) {
    console.error('Error in calculateROI controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error calculating ROI',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Get conversation history for a specific conversation ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }
    
    const history = chatService.getConversationHistory(conversationId);
    
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error in getConversationHistory controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving conversation history',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

/**
 * Clear conversation history for a specific conversation ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }
    
    const success = chatService.clearConversation(conversationId);
    
    return res.status(200).json({
      success: true,
      data: { cleared: success }
    });
  } catch (error) {
    console.error('Error in clearConversation controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};