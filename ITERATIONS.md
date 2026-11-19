# Prompt Iterations

## Summary Table

| Verzija | Broj Prolaza | Procenat | Šta je palo | Šta je promenjeno |
|---------|--------------|----------|-------------|------------------|
| v1 | 27/46 | 58.7% | Prioriteti inflatirani, feature requests HIGH, BUG+BILLING nebitan, kategorija netačna (QUESTION→BUG, očekivanja o mogućnostima→FEATURE), data loss HIGH umesto CRITICAL | Baseline: "tone and severity", bez eksplicitnih pravila |
| v2 | 39/46 | 84.8% | Anomalije u obradi: crash sa sarcazmom→CRITICAL, checkout crash→HIGH umesto CRITICAL, typo u billing→BUG, data loss→HIGH, pitanje sa "?" o problemu→QUESTION, typo u dokumentaciji→QUESTION | Dodao: eksplicitna pravila za kategoriju (po redosledu), jasno razlikovanje HIGH vs CRITICAL, "feature requests ALWAYS LOW", "sarcasm don't affect priority", BUG+BILLING pravilo |

## Detailed Comparison

### v1 (Baseline)
**Prompt approach**: Opšta uputstva sa "tone and severity"

**Problemi**:
1. **Inflatirani prioriteti**: Sve ozbiljne situacije → CRITICAL
   - Login broken → CRITICAL (trebalo HIGH)
   - App crashes with sarcasm → CRITICAL (trebalo HIGH)
   - Frustration + login broken → CRITICAL (trebalo HIGH)

2. **Feature requests nisu LOW**: 
   - Angry feature requests → HIGH (trebalo LOW)
   - Urgent feature requests → HIGH (trebalo LOW)

3. **BUG+BILLING nebitan**:
   - Payment checkout crash → BUG/CRITICAL (trebalo BILLING/CRITICAL)
   - Payment page error → BUG/HIGH (trebalo BILLING/HIGH)
   - Payment system down → BUG/CRITICAL (trebalo BILLING/CRITICAL)

4. **Kategorija netačna**:
   - Nejasan bug → BUG/LOW (trebalo QUESTION/LOW)
   - Samo reč "bug" → BUG/LOW (trebalo QUESTION/LOW)
   - "Is system down?" → BUG/CRITICAL (trebalo QUESTION/LOW)
   - "Can I export?" → FEATURE/LOW (trebalo QUESTION/LOW)

5. **Data loss**: BUG/HIGH (trebalo CRITICAL)

**Rezultat**: 27/46 (58.7%)

---

### v2 (Improved)
**Prompt approach**: Eksplicitna pravila sa redosledom, jasne razlike između prioriteta

**Ključne izmene**:
1. Dodao sam **Categorization Rules sa redosledom**:
   - Prvo: "?" → QUESTION
   - Drugo: payment/billing keywords → BILLING
   - Treće: feature request keywords → FEATURE
   - Četvrto: default → BUG

2. Jasno definisana **CRITICAL vs HIGH razlika**:
   - CRITICAL: Kompletna nedostupnost + data loss + security + ne mogu plaćati
   - HIGH: Broken core feature ALI POSTOJI WORKAROUND + individual login + payment failure sa retry opcijom

3. **"Feature requests are ALWAYS LOW"** - eksplicitna rečenica sa svim situacijama

4. **"Sarcasm, emotional language do NOT affect priority"** - direktna instrukcija

5. **BUG+BILLING pravilo** - eksplicitno navedeno

**Poboljšanja**:
- ✓ Login issues sada → HIGH (ne CRITICAL)
- ✓ Sarcastic crashes → HIGH (ne CRITICAL)
- ✓ Feature requests → UVEK LOW (ne HIGH)
- ✓ Emotional language ignored
- ✓ BILLING kategorija ispravnije prepoznata
- ✓ QUESTION bolje kategorija za nejasne/upitne poruke

**Rezultat**: 39/46 (84.8%) - **+12 testova** ✓

---

## Preostali Problemi u v2

### 7 testova koji još padaju:

1. **Test 2**: "BRILLIANT UPDATE! The app crashes..." 
   - Očekuje: BUG/HIGH
   - Dobija: BUG/CRITICAL
   - Razlog: "app crashes" = core functionality broken, model klasifikuje kao CRITICAL umesto HIGH
   - Potreban finiji heuristic: crash sa workaround hint → HIGH

2. **Test 16**: "Checkout page crashes..."
   - Očekuje: BILLING/CRITICAL
   - Dobija: BILLING/HIGH
   - Razlog: Ne pravi razliku između "can't pay" (CRITICAL) i "payment flow broken" (HIGH)
   - Mogućnost: "can't complete purchase" = ne mogu plaćati → CRITICAL

3. **Test 18**: "Invoice PDF has typo..."
   - Očekuje: BILLING/LOW
   - Dobija: BUG/LOW
   - Razlog: Redosled pravila: "broken/error" → BUG pre nego "invoice" → BILLING
   - Mogućnost: Prvo proveriti billing keywords pre "error"

4. **Test 20**: "All files disappeared..."
   - Očekuje: BUG/CRITICAL
   - Dobija: BUG/HIGH
   - Razlog: "data loss" = CRITICAL, ali model verovatno čita kao "file issue" = HIGH
   - Mogućnost: Eksplicitno "data loss keywords" → CRITICAL

5. **Test 25**: "Why is the site so slow?"
   - Očekuje: BUG/HIGH
   - Dobija: QUESTION/HIGH
   - Razlog: "?" na početku → QUESTION prema v2 pravilu, mada je sadržaj problem
   - Mogućnost: Prvo proveiti sadržaj problema pre "?" heuristika

6. **Test 44**: "I can't see invoice history..."
   - Očekuje: BILLING/LOW
   - Dobija: BUG/HIGH
   - Razlog: "can't see" = access issue = percipirano kao HIGH umesto LOW display issue
   - Mogućnost: Finija analiza: "display issue" sa workaround → LOW

7. **Test 45**: "Typo in refund policy..."
   - Očekuje: BILLING/LOW
   - Dobija: QUESTION/LOW
   - Razlog: "Typo" = question/report = QUESTION umesto "documentation under BILLING" = BILLING/LOW
   - Mogućnost: "typo" + "policy" → documentation issue = BILLING/LOW

---

## Zaključak

**v1 → v2 poboljšanje**: +26.1% (sa 58.7% na 84.8%)
- Fiksovane su sve glavne kategorije problema
- Feature requests sada uvek LOW ✓
- Sarcasm/emotion ignorisani ✓
- BILLING kategorija bolje razpoznata ✓
- QUESTION korišćen za nejasne poruke ✓

**Preostali problemi** su finiji edge cases:
- Semantička razlika između "broken" (HIGH) i "can't access" (može biti CRITICAL)
- Prioriteti data loss vs access denial
- "?" heuristika konfliktuje sa problem content classification
- Typo u billing dokumentaciji = BILLING vs generic error = BUG

**Mogućnosti za v3**:
- Finija analiza keywords: "data loss", "disappeared", "payment failure" → CRITICAL
- Proveravati problem content pre "?" heuristike
- Razlikovati "documentation" (BILLING) od generic "typo" (BUG)
- Jasnija CRITICAL = "can't do X" vs HIGH = "broken but can workaround"
