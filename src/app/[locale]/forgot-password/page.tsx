import { setRequestLocale } from 'next-intl/server';
import { ForgotPasswordClient } from './client';

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ForgotPasswordClient locale={locale} />;
}
