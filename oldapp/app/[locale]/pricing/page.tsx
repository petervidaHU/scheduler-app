import { getTranslations } from "next-intl/server";

export default async function PricingPage() {
    const t = await getTranslations('pricing');
    return (
        <div>
            <h1>{t('message1')}</h1>
        </div>
    );
}