/** โครงสร้าง error ที่อาจได้จาก API/axios */
export interface ApiError {
  message?: string;
  description?: string;
  error_message?: string;
  response?: {
    data?: {
      message?: string | string[];
      description?: string;
    };
  };
}
