import { z } from 'zod';

/**
 * 法人コードのバリデーション
 */
export const companyCodeSchema = z.string()
  .length(8, '法人コードは8桁である必要があります')
  .regex(/^[A-Z0-9]{8}$/, '法人コードは英数字8桁である必要があります');

/**
 * 社員番号のバリデーション
 */
export const employeeNumberSchema = z.string()
  .min(1, '社員番号は必須です')
  .max(20, '社員番号は20文字以内である必要があります')
  .regex(/^[A-Z0-9]+$/, '社員番号は半角英数字である必要があります');

/**
 * パスワードのバリデーション
 */
export const passwordSchema = z.string()
  .min(8, 'パスワードは8文字以上である必要があります')
  .regex(/[A-Za-z]/, 'パスワードには英字が含まれる必要があります')
  .regex(/[0-9]/, 'パスワードには数字が含まれる必要があります')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'パスワードには記号が含まれる必要があります');

/**
 * ログインリクエストのバリデーション
 */
export const loginSchema = z.object({
  companyCode: companyCodeSchema,
  employeeNumber: employeeNumberSchema,
  password: z.string().min(1, 'パスワードは必須です'),
});

/**
 * ユーザー登録リクエストのバリデーション
 */
export const registerSchema = z.object({
  companyCode: companyCodeSchema,
  employeeNumber: employeeNumberSchema,
  name: z.string().min(1, '氏名は必須です').max(50, '氏名は50文字以内である必要があります'),
  birthDate: z.string().refine((date) => {
    const birth = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? age - 1 
      : age;
    return actualAge >= 18;
  }, '18歳以上である必要があります'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: '性別はMALE、FEMALE、OTHERのいずれかである必要があります' })
  }),
  departmentId: z.string().uuid('部署IDが無効です'),
  jobType: z.string().optional(),
  password: passwordSchema,
});

/**
 * プロフィール登録リクエストのバリデーション
 */
export const profileSchema = z.object({
  hasChildren: z.boolean(),
  childrenAges: z.array(z.number().int().min(0).max(30)).optional(),
  isMarried: z.boolean(),
  interestedCategories: z.array(z.string()).optional(),
});

/**
 * バリデーションミドルウェア
 */
export function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      next(error);
    }
  };
}

