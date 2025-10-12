# 🔐 Instrukcje Konfiguracji Panelu Admina

## ⚠️ WAŻNE BEZPIECZEŃSTWO

Obecnie aplikacja ma podstawową ochronę, ale wymaga konfiguracji w Supabase.

---

## 📋 Krok 1: Uruchom migracje SQL w Supabase

### 1.1 Dodaj system ról

1. Otwórz **Supabase Dashboard**
2. Przejdź do **SQL Editor**
3. Kliknij **New Query**
4. Skopiuj i wklej zawartość pliku: `supabase-add-roles.sql`
5. Kliknij **Run** (Ctrl+Enter)
6. Poczekaj na komunikat: "Success"

### 1.2 Dodaj funkcję RPC

1. W **SQL Editor** utwórz nowe query
2. Skopiuj i wklej zawartość pliku: `supabase-add-rpc-function.sql`
3. Kliknij **Run**
4. Sprawdź czy funkcja się utworzyła:
   - Idź do **Database** → **Functions**
   - Powinieneś zobaczyć `get_user_profile_with_role`

---

## 👤 Krok 2: Utwórz konto super admina

### 2.1 Zarejestruj swoje konto

1. Uruchom aplikację: `npm run tauri dev`
2. Zarejestruj się używając swojego maila
3. Zaloguj się

### 2.2 Nadaj sobie uprawnienia admina

1. Otwórz **Supabase Dashboard**
2. Przejdź do **SQL Editor**
3. Uruchom to query (ZMIEŃ EMAIL NA SWÓJ!):

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'twoj-email@example.com'
);
```

4. Zweryfikuj:

```sql
SELECT username, email, role 
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin');
```

Powinieneś zobaczyć swoje konto z rolą `super_admin`!

---

## 🧪 Krok 3: Testowanie

### 3.1 Test dostępu admina

1. Zaloguj się do aplikacji
2. Przejdź do Dashboard
3. Sprawdź czy widzisz przycisk **"🔧 Panel Admina"** w prawym dolnym rogu
4. Kliknij go - powinieneś mieć dostęp!

### 3.2 Test braku dostępu (ważne!)

1. Wyloguj się
2. Zarejestruj NOWE konto (inny email)
3. Zaloguj się na nowe konto
4. Sprawdź Dashboard - **NIE** powinieneś widzieć przycisku "Panel Admina"
5. Jeśli spróbujesz wejść przez URL hack → Dostaniesz błąd "Brak dostępu"

---

## 🔒 Bezpieczeństwo - Co jest chronione?

### ✅ Zabezpieczenia które masz:

1. **Row Level Security (RLS)** w Supabase
   - Tylko admini mogą tworzyć/edytować/usuwać kursy
   - Tylko super_admin może usuwać
   - Użytkownicy widzą tylko opublikowane kursy

2. **Backend weryfikacja**
   - Rust sprawdza czy użytkownik ma rolę admin
   - Token JWT jest weryfikowany przez Supabase

3. **Frontend guard**
   - Przycisk widoczny tylko dla adminów
   - Weryfikacja przed wejściem do panelu

4. **Audit log**
   - Wszystkie akcje adminów są logowane
   - Możesz zobaczyć kto, co i kiedy zrobił

### ⚠️ Co jeszcze warto dodać (opcjonalnie):

- [ ] **2FA (Two-Factor Authentication)** dla adminów
- [ ] **Rate limiting** - ograniczenie liczby requestów
- [ ] **IP Whitelist** - dostęp tylko z określonych IP
- [ ] **Session timeout** - automatyczne wylogowanie po X minut
- [ ] **Email notifications** - powiadomienia o akcjach adminów

---

## 📊 Krok 4: Zarządzanie rolami

### Role w systemie:

- **`user`** (domyślna) - zwykły użytkownik, może uczyć się
- **`admin`** - może tworzyć i edytować kursy/lekcje
- **`super_admin`** - może wszystko + usuwać + zarządzać adminami

### Jak dodać kolejnego admina:

```sql
-- Znajdź użytkownika po email
SELECT id, username, email 
FROM auth.users 
WHERE email = 'nowy-admin@example.com';

-- Nadaj rolę admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_ID_Z_POPRZEDNIEGO_QUERY';
```

### Jak odebrać uprawnienia:

```sql
UPDATE profiles 
SET role = 'user' 
WHERE id = 'USER_ID';
```

---

## 🔍 Krok 5: Monitorowanie (Audit Log)

### Sprawdź logi akcji adminów:

```sql
SELECT 
  u.email as admin_email,
  al.action,
  al.resource_type,
  al.resource_id,
  al.details,
  al.created_at
FROM admin_audit_log al
JOIN auth.users u ON u.id = al.admin_id
ORDER BY al.created_at DESC
LIMIT 50;
```

### Znajdź podejrzane akcje:

```sql
-- Kto usuwał lekcje?
SELECT 
  u.email,
  al.action,
  al.resource_type,
  al.created_at
FROM admin_audit_log al
JOIN auth.users u ON u.id = al.admin_id
WHERE al.action = 'delete'
ORDER BY al.created_at DESC;
```

---

## 🚨 Bezpieczeństwo - SQL Injection

### ✅ DOBRE praktyki (już zaimplementowane):

```rust
// Supabase client automatycznie sanitizuje dane
client.get_user_profile_with_role(&access_token).await?;
```

```typescript
// Parametryzowane query przez Supabase SDK
const { data } = await supabase
  .from('lessons')
  .insert({ title: userInput }); // ✅ Bezpieczne!
```

### ❌ ZŁE praktyki (NIGDY nie rób tego):

```rust
// NIE konstruuj SQL ręcznie z user input!
let query = format!("SELECT * FROM users WHERE email = '{}'", user_email); // ❌ NIEBEZPIECZNE!
```

### Dlaczego jest bezpieczne:

1. **Supabase SDK** - używa prepared statements
2. **RLS Policies** - SQL injection nie obejdzie RLS
3. **Type-safe** - TypeScript + Rust wymuszają typy
4. **Validation** - Frontend + Backend walidują dane

---

## 🆘 Troubleshooting

### Problem: "Nie widzę przycisku Panel Admina"

**Rozwiązanie:**
1. Sprawdź czy masz rolę admin:
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```
2. Wyloguj się i zaloguj ponownie
3. Sprawdź console.log w DevTools (F12) - powinno być: `isAdmin: true`

### Problem: "Funkcja get_user_profile_with_role nie istnieje"

**Rozwiązanie:**
1. Uruchom ponownie: `supabase-add-rpc-function.sql`
2. Sprawdź czy funkcja istnieje:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name = 'get_user_profile_with_role';
   ```

### Problem: "Permission denied for table profiles"

**Rozwiązanie:**
1. Sprawdź RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Upewnij się że uruchomiłeś `supabase-add-roles.sql`

---

## 📝 Checklist przed wejściem na produkcję:

- [ ] Wszystkie migracje SQL uruchomione
- [ ] Przynajmniej 1 super_admin utworzony
- [ ] Testowano brak dostępu dla zwykłych użytkowników
- [ ] Audit log działa i loguje akcje
- [ ] RLS policies włączone na wszystkich tabelach
- [ ] `.env` NIE jest w repozytorium (sprawdź .gitignore)
- [ ] Zmieniono domyślne hasła i klucze
- [ ] Włączono email confirmation w Supabase (opcjonalnie)
- [ ] Skonfigurowano backup bazy danych

---

## 🎓 Dalsza nauka o bezpieczeństwie:

1. **OWASP Top 10** - https://owasp.org/www-project-top-ten/
2. **Supabase Security** - https://supabase.com/docs/guides/auth/row-level-security
3. **JWT Best Practices** - https://tools.ietf.org/html/rfc8725

---

**Pytania? Problemy? Sprawdź logi w Supabase Dashboard → Logs**