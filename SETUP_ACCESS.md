# CINE — Login + Free 24h Key + Premium (zero budget)

## 1. Supabase SQL (ek baar)
Supabase > SQL Editor > `supabase/migration_access.sql` paste karke Run karein.
Yeh existing data delete nahi karta. Existing Google users ki profile bhi ban jaayegi.

## 2. Supabase > Authentication > URL Configuration
Site URL aur Redirect URLs mein apni site ka URL ho (jaise https://your-site.netlify.app).
Google provider pehle se on hona chahiye (abhi wala login hi use hoga).

## 3. Env variables (Netlify/Vercel dashboard mein, .env.local mein nahi commit karein)
- NEXT_PUBLIC_SUPABASE_URL      (existing)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (existing)
- SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (existing)
- ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET (existing)
- NEXT_PUBLIC_UPI_ID            (NEW, optional) — aapki UPI ID, jaise name@upi

## 4. Admin flow (Premium)
User site pe Google login karke User ID copy karta hai aur UPI se payment karta hai.
Aap admin panel > Premium Users mein User ID (ya email) aur plan daal kar Activate karein.

## Access rules
- Free key: user 24 ghante mein ek key bana sakta hai. Key 24 ghante mein redeem karni hoti hai. Redeem hone par 24 ghante ka access milta hai.
- Premium: plan ke hisaab se time milta hai (24h ₹2, 7d ₹12, 30d ₹51). Expiry har request par check hoti hai.
- Access check server par hota hai. Browser se Premium set nahi ho sakta.

## Limitations (honest)
- Video ka URL ek baar unlock hone ke baad user share kar sakta hai. Pakka protection ke liye signed/private hosting chahiye, jo paid ho sakti hai.
- Premium activation manual hai (admin UPI verify karta hai). Automatic payment ke liye gateway chahiye, jisme fee lagti hai.
- Email/password login abhi nahi hai. Sirf Google login hai, jo already set hai.
- Build aur test is sandbox mein nahi chal paaye (no network). Deploy se pehle `npm install && npm run build` chalayein.

## Testing checklist
1. Logged out: Google login button dikhe.
2. Login, phir Generate Free Key: key dikhe. Dobara turant generate karne par 429 aaye.
3. Redeem: video khule aur "Expires" dikhe. Same key dobara redeem par error aaye.
4. Admin > Premium Users: user ID se activate karein, premium status dikhe.
5. Expiry ke baad access band ho jaye.
