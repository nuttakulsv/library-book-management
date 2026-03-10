/** Master Images - รูปที่เก็บในระบบ ใช้ id อ้างอิง */
export interface Image {
  id: number;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  originalName?: string;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
}
