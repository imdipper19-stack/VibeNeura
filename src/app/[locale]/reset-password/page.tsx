import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ResetPasswordClient } from './client';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <ResetPasswordClient locale={locale} />
    </Suspense>
  );
}
