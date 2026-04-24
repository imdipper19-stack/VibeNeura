import { setRequestLocale, getTranslations } from 'next-intl/server';
import { tokenPacks, proPasses } from '@/lib/billing/catalog';
import { BillingClient } from '@/components/billing/billing-client';

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string; status?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('billing');

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{t('balance')}</h1>
      <p className="mt-2 text-on-surface-variant">
        {t('tokenPacksSubtitle')}
      </p>

      {sp.status === 'success' && (
        <div className="mt-6 rounded-lg border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-sm text-tertiary">
          Оплата прошла. Токены и PRO Pass обновятся после подтверждения провайдером.
        </div>
      )}
      {sp.status === 'fail' && (
        <div className="mt-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          Платёж не прошёл. Попробуйте ещё раз или выберите другой способ.
        </div>
      )}

      <div className="mt-10">
        <BillingClient packs={tokenPacks()} passes={proPasses()} initialFocus={sp.focus} />
      </div>
    </div>
  );
}
