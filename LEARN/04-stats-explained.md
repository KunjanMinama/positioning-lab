# LEARN 04: Statistics Explained in Plain Language

> **Target:** You must be able to explain the Wilson score interval and walk through a hand-calculation on a whiteboard in the live interview without hesitating.

---

## 1. Why Not Just Compare Percentages? (The Law of Small Numbers)

Suppose Variant A has 2 clicks from 5 visitors (40%), and Variant B has 10 clicks from 40 visitors (25%).
Is Variant A better?
**Absolutely not.** With only 5 visitors, random chance dominates. If the 6th visitor doesn't click, Variant A drops to $2/6 = 33\%$. If the 7th doesn't click, it's $2/7 = 28\%$.

In early GTM testing, traffic is almost always limited. Comparing raw percentages without measuring uncertainty is how teams make costly positioning mistakes.

---

## 2. Why the Wilson Score Interval?

Most introductory textbooks teach the Wald interval:
$$\hat{p} \pm 1.96 \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$$

### Why the Wald Interval Breaks in Real Life:
1. **The zero-variance trap:** If $\hat{p} = 0$ (0 clicks out of 10), Wald says the margin of error is $0$. It claims you have 100% confidence that the conversion rate is exactly 0%! That is nonsensical.
2. **Overshoot:** For small $n$ and extreme $\hat{p}$, Wald produces intervals that go below 0% or above 100%.
3. **Under-coverage:** The true coverage probability for small $n$ is often far below 95% (sometimes as low as 80%).

### Why Wilson Works:
The Wilson score interval inverts the score test. It shrinks the center slightly toward 50% (the "pseudocount" effect) and widens the bounds symmetrically on the logit scale.
- It **never** goes below 0 or above 1.
- When $x = 0$, it gives a realistic positive upper bound (e.g., $0/10$ gives $[0, 0.283]$).
- For large $n$, it converges smoothly to the normal distribution.

---

## 3. The Formula & A Worked Example by Hand

For a 95% confidence level, $z = 1.96$, so $z^2 = 3.8416 \approx 3.84$.

$$\text{Denominator} = 1 + \frac{z^2}{n} = 1 + \frac{3.8416}{n}$$

$$\text{Center} = \frac{\hat{p} + \frac{z^2}{2n}}{\text{Denominator}} = \frac{\hat{p} + \frac{1.9208}{n}}{1 + \frac{3.8416}{n}}$$

$$\text{Margin} = \frac{z \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z^2}{4n^2}}}{\text{Denominator}} = \frac{1.96 \sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{0.9604}{n^2}}}{1 + \frac{3.8416}{n}}$$

$$\text{Confidence Interval} = [\text{Center} - \text{Margin}, \text{Center} + \text{Margin}]$$

### Worked Hand Calculation: $x = 20, n = 100$ ($\hat{p} = 0.20$)
1. $\hat{p} = 0.20$
2. $\text{Denominator} = 1 + \frac{3.8416}{100} = 1.038416$
3. $\text{Center} = \frac{0.20 + 0.019208}{1.038416} = \frac{0.219208}{1.038416} \approx 0.2111 \ (21.11\%)$
4. Inside the square root:
   - $\frac{\hat{p}(1-\hat{p})}{n} = \frac{0.20 \times 0.80}{100} = \frac{0.16}{100} = 0.0016$
   - $\frac{z^2}{4n^2} = \frac{3.8416}{40000} = 0.00009604$
   - Sum $= 0.00169604$
   - $\sqrt{0.00169604} \approx 0.041183$
5. Numerator for margin $= 1.96 \times 0.041183 \approx 0.080719$
6. $\text{Margin} = \frac{0.080719}{1.038416} \approx 0.0777 \ (7.77\%)$
7. **Resulting 95% Wilson Interval:**
   - Lower bound: $0.2111 - 0.0777 = 0.1334 \ (13.34\%)$
   - Upper bound: $0.2111 + 0.0777 = 0.2888 \ (28.88\%)$

Notice that the center shifted from $20.0\%$ to $21.1\%$, and our 95% confidence interval is approximately $[13.3\%, 28.9\%]$.

---

## 4. Why "Peeking" is Dangerous (The False Positive Trap)

If you check a dashboard every 10 visitors and stop the test the moment one variant looks ahead, your actual false positive rate is not 5%—**it can rise to 30% or 40%**!
This is called the **optional stopping problem**: random noise will temporarily cause one line to jump ahead. If you stop on noise, you lock in a false winner.

### Positioning Lab's Defense:
1. **Pre-registration:** Minimum sample size per variant (default: 50) must be defined before launch.
2. **Status Gate:**
   - **`Not enough data`:** Enforced whenever any variant has $n < \text{minSamplePerVariant}$.
   - **`Directional`:** All variants meet minimum $n$, but 95% intervals overlap.
   - **`Evidence favors X`:** All variants meet minimum $n$, and the leader's lower bound is strictly greater than the runner-up's upper bound.
3. **Code Enforcement:** The readout generator will throw an error and refuse to render if the AI tries to declare a winner while the status gate is `Not enough data`.
