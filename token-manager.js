// GitHub Token Manager - 使用增强加密方案

// 加密密钥（可以根据需要修改）
const ENCRYPTION_KEY = 'moon_portfolio_secure_key_2024';

// 加密后的GitHub令牌（使用异或+Base64加密）
const encryptedToken = 'ioabhqqSsIKVkrDd2K3rt7K3uKvVtd2Slq3o2/vY3ZyXsefDuaWHrNmiooqzuI6rvYLXiJORjLCH1f6FlJmcpbC6rJmkhKOmiJvou6Sqs7a36r6ssbKH39H6nZ63';

// 自定义解密函数
function decrypt(encrypted, key) {
    try {
        const decoded = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            const encodedChar = decoded.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode((encodedChar - 128) ^ keyChar);
        }
        return decrypted;
    } catch (error) {
        console.error('解密失败:', error);
        return '';
    }
}

// 获取解密后的GitHub令牌
function getGitHubToken() {
    return decrypt(encryptedToken, ENCRYPTION_KEY);
}

// 用于重新加密令牌的工具函数（仅用于开发环境）
function encryptToken(token, key = ENCRYPTION_KEY) {
    try {
        let encrypted = '';
        for (let i = 0; i < token.length; i++) {
            const tokenChar = token.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode((tokenChar ^ keyChar) + 128);
        }
        return btoa(encrypted);
    } catch (error) {
        console.error('加密失败:', error);
        return '';
    }
}

