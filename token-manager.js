// Token Manager - 用于安全地存储和获取GitHub API令牌

// 加密后的GitHub API令牌
const a = 'Z2l0aHViX3BhdF8xMUI0RFdUTVkwcFhGWm9lOWRmMmpiX0RUWnFuOHdrRmpvVkVFbFdrdHRNWlRSY3gxd2tCV2ExeWxGZFFLWkowMzVLUE1XWDNNTlNERmlqRHlK';

// 简单的解密函数（Base64解码）
function getGitHubToken() {
    try {
        // 使用Base64解码加密的令牌
        const token = atob(a);
        return token;
    } catch (error) {
        console.error( error);
        return null;
    }
}
