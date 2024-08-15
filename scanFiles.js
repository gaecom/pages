const fs = require('fs');
const path = require('path');

function scanFolderForHTMLFiles(folderPath,prefix) {
  // 检查文件夹是否存在
  if (!fs.existsSync(folderPath)) {
    console.error(`错误: 文件夹 "${folderPath}" 不存在`);
    return [];
  }
  let index=1

  const results = [];

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 扫描第二层文件夹
      const subFiles = fs.readdirSync(filePath);
      for (const subFile of subFiles) {
        const subFilePath = path.join(filePath, subFile);
        const subStats = fs.statSync(subFilePath);

        if (subStats.isFile() && path.extname(subFile).toLowerCase() === '.html') {
          const content = fs.readFileSync(subFilePath, 'utf-8');
          const titleMatch = content.match(/<title>([^<]+)<\/title>/);

          if (titleMatch) {
            const title = titleMatch[1];
            const [theTitle, detail] = title.split('--');
            const relativePath = path.relative(folderPath, subFilePath);

            results.push({
              title: (index++)+". " +theTitle.trim(),
              detail: detail.trim(),
              url: `.${prefix}/`+relativePath.replace(/\\/g, '/')
            });
          }
        }
      }
    }
  }

  return results;
}

// 从命令行获取文件夹路径
const folderPath = process.argv[2] || 'p';
if (!folderPath) {
  console.error('请提供要扫描的文件夹路径');
  process.exit(1);
}


const prefix='/'+folderPath.split('/').pop()
const scriptDir = __dirname;

const index=`${scriptDir}/index.temp.html`

const results = scanFolderForHTMLFiles(folderPath,prefix);

const bFileContent = fs.readFileSync(index, 'utf-8');
const updatedContent = bFileContent.replace(/\"#data#\"/, JSON.stringify(results));

fs.writeFileSync(scriptDir+"/index.html", updatedContent, 'utf-8');
// 输出更新后的内容

console.log(results);
