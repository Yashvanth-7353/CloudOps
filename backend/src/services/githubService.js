// backend/src/services/githubService.js
const axios = require('axios');
const crypto = require('crypto');

class GithubService {
  /**
   * Creates a Webhook on the specified GitHub repository
   */
  async createWebhook(owner, repo, accessToken) {
    // Ensure you have BACKEND_PUBLIC_URL in your .env (e.g., your ngrok URL)
    const baseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
    const webhookUrl = `${baseUrl}/api/deploy/webhook`;
    
    // Generate a secure, random secret for webhook payload validation
    const webhookSecret = crypto.randomBytes(20).toString('hex');

    try {
      const response = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events: ['push'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            secret: webhookSecret,
            insecure_ssl: '0' 
          }
        },
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      return {
        success: true,
        webhookId: response.data.id.toString(),
        webhookSecret
      };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg === 'Hook already exists on this repository') {
        throw new Error('A webhook for CloudOps already exists on this repository.');
      }
      
      throw new Error(`Failed to create GitHub webhook: ${errorMsg}`);
    }
  }

  async deleteWebhook(owner, repo, webhookId, accessToken) {
    try {
      await axios.delete(
        `https://api.github.com/repos/${owner}/${repo}/hooks/${webhookId}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      return true;
    } catch (error) {
      // If GitHub says 404 Not Found, it's already deleted, which is fine!
      if (error.response?.status === 404) {
        return true; 
      }
      console.error('Error deleting webhook:', error.response?.data || error.message);
      throw new Error('Failed to delete webhook from GitHub');
    }
  }
}

module.exports = new GithubService();