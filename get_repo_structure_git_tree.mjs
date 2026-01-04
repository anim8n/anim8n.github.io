import fetch from 'node-fetch';

// GitHub仓库配置
const repoUrl = 'https://github.com/anim8n/portfolio';
const token = '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';

// 解析仓库URL获取owner和repo名称
function parseRepoUrl(url) {
    const match = url.match(/github\.com\/(.*?)\/(.*?)(?:\.git)?$/);
    if (!match) {
        throw new Error('Invalid GitHub repository URL');
    }
    return { owner: match[1], repo: match[2] };
}

// 获取默认分支
async function getDefaultBranch(owner, repo) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to get repository info: ${response.statusText}`);
    }
    
    const repoInfo = await response.json();
    return repoInfo.default_branch;
}

// 获取仓库的Git树结构
async function getGitTree(owner, repo, branch) {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to get Git tree: ${response.statusText}`);
    }
    
    return await response.json();
}

// 构建目录树结构
function buildDirectoryTree(treeItems) {
    const root = { name: '', type: 'dir', children: [] };
    
    // 按路径排序
    treeItems.sort((a, b) => a.path.localeCompare(b.path));
    
    treeItems.forEach(item => {
        const pathParts = item.path.split('/');
        let current = root;
        
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const isLast = i === pathParts.length - 1;
            
            // 确保current.children存在
            if (!current.children) {
                current.children = [];
            }
            
            // 查找当前目录下是否已有该子项
            let child = current.children.find(c => c.name === part);
            
            if (!child) {
                // 创建新的子项
                child = {
                    name: part,
                    type: isLast ? item.type : 'tree', // 使用Git的类型: tree/dir, blob/file
                    children: isLast ? undefined : []
                };
                
                // 只在不是最后一部分时添加children数组
                if (!isLast) {
                    child.children = [];
                }
                
                current.children.push(child);
            }
            
            current = child;
        }
    });
    
    return root;
}

// 格式化显示目录树
function formatDirectoryTree(node, indent = '') {
    let result = '';
    
    // 确保node.children存在
    if (!node.children || node.children.length === 0) {
        return result;
    }
    
    // 按类型排序：目录(tree)在前，文件(blob)在后
    node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'tree' ? -1 : 1;
    });
    
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const isLast = i === node.children.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const nextIndent = indent + (isLast ? '    ' : '│   ');
        
        result += `${indent}${prefix}${child.name}\n`;
        
        if (child.type === 'tree' && child.children) {
            result += formatDirectoryTree(child, nextIndent);
        }
    }
    
    return result;
}

// 主函数
async function main() {
    try {
        console.log('正在获取GitHub仓库结构...');
        console.log(`仓库: ${repoUrl}`);
        console.log('==================================================');
        
        const { owner, repo } = parseRepoUrl(repoUrl);
        
        // 获取默认分支
        const defaultBranch = await getDefaultBranch(owner, repo);
        console.log(`默认分支: ${defaultBranch}`);
        
        // 获取Git树
        const tree = await getGitTree(owner, repo, defaultBranch);
        
        if (tree.truncated) {
            console.warn('警告: 树结构被截断，可能包含超过100,000个条目');
        }
        
        // 构建目录树
        const rootTree = buildDirectoryTree(tree.tree);
        
        // 格式化并显示
        const structure = formatDirectoryTree(rootTree);
        console.log(structure);
        
        console.log('==================================================');
        console.log('获取仓库结构成功！');
        console.log(`总条目数: ${tree.tree.length}`);
        
    } catch (error) {
        console.error('获取仓库结构失败:', error.message);
        console.error('错误:', error);
    }
}

main();