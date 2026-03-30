
export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message,
});

export const errorResponse = (message: string, errors?: any) => ({
  success: false,
  message,
  errors,
});