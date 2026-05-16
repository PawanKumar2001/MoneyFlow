export type IncomeType = "SALARIED" | "FREELANCER";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
  incomeType: IncomeType;
  isSetupDone: boolean;
  currency: string;
}