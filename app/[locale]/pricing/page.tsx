import { getLocale } from "next-intl/server";

export default async function PricingPage() {
    const loc = await getLocale();
    console.log("locale in server side pricing", loc);
    return (
        <div>
            <h1>Pricing</h1>
        </div>
    );
}