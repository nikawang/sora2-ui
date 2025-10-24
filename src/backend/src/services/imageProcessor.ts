import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * 解析分辨率字符串
 * @param resolution 分辨率字符串，如 "1280x720"
 * @returns { width, height }
 */
export function parseResolution(resolution: string): { width: number; height: number } {
  const parts = resolution.toLowerCase().split('x');
  if (parts.length !== 2) {
    throw new Error(`Invalid resolution format: ${resolution}`);
  }
  
  const width = parseInt(parts[0], 10);
  const height = parseInt(parts[1], 10);
  
  if (isNaN(width) || isNaN(height)) {
    throw new Error(`Invalid resolution values: ${resolution}`);
  }
  
  return { width, height };
}

/**
 * 预处理图片：调整尺寸以匹配视频参数
 * @param inputPath 输入图片路径
 * @param targetResolution 目标分辨率，如 "1280x720"
 * @returns 处理后的图片路径
 */
export async function preprocessImage(
  inputPath: string,
  targetResolution: string
): Promise<string> {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Image file not found: ${inputPath}`);
  }

  const { width: targetWidth, height: targetHeight } = parseResolution(targetResolution);
  
  console.log(`🖼️ Preprocessing image: ${inputPath}`);
  console.log(`   Target resolution: ${targetWidth}x${targetHeight}`);

  // 获取原始图片信息
  const metadata = await sharp(inputPath).metadata();
  console.log(`   Original size: ${metadata.width}x${metadata.height}`);

  // 如果尺寸已经匹配，直接返回原路径
  if (metadata.width === targetWidth && metadata.height === targetHeight) {
    console.log(`   ✓ Image already matches target resolution, no processing needed`);
    return inputPath;
  }

  // 生成处理后的文件路径
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  const dirname = path.dirname(inputPath);
  const outputPath = path.join(dirname, `${basename}-resized-${targetWidth}x${targetHeight}${ext}`);

  try {
    // 使用 sharp 调整图片尺寸
    // fit: 'cover' 会裁剪图片以填充目标尺寸
    // fit: 'contain' 会保持纵横比，可能留白
    // fit: 'fill' 会拉伸图片以填充目标尺寸（可能变形）
    await sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: 'cover', // 裁剪填充，保持纵横比
        position: 'center', // 从中心裁剪
      })
      .toFile(outputPath);

    console.log(`   ✓ Image resized and saved to: ${outputPath}`);
    return outputPath;
  } catch (error: any) {
    console.error(`   ✗ Failed to resize image:`, error);
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
}

/**
 * 清理处理后的临时图片文件
 * @param imagePath 图片路径
 */
export function cleanupProcessedImage(imagePath: string): void {
  if (imagePath.includes('-resized-') && fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      console.log(`🗑️ Cleaned up processed image: ${imagePath}`);
    } catch (error) {
      console.error(`Failed to cleanup image ${imagePath}:`, error);
    }
  }
}
