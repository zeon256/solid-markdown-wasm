# Markdown syntax guide 🔥🔥🔥🔥

## Blockquotes

> [!NOTE]
> This is an informational blockquote. $x+3$

> [!TIP]
> This is a tip blockquote.

> [!IMPORTANT]
> This is an important blockquote.

> [!WARNING]
> This is a warning blockquote.

> [!CAUTION]
> This is a caution blockquote.


> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Blocks of code

```javascript
let message = 'Hello world';
alert(message);
```

```cpp
#include <iostream>
#include <vector>
 
auto main() -> int {
    std::vector<int> v = {8, 4, 5, 9};
 
    v.emplace_back(6);
    v.emplace_back(9);
 
    v[2] = -1;
 
    for (int n : v)
        std::cout << n << ' ';
    std::cout << '\n';
}
```

## Headers

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

## Emphasis

*This text will be italic*  
_This will also be italic_

**This text will be bold**  
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b
    * Item 3a
    * Item 3b

### Ordered

1. Item 1
2. Item 2
3. Item 3
    1. Item 3a
    2. Item 3b

### Tasklist
- [x] Wake up
- [ ] Drink water
- [ ] Make lunch

## Images

![This is an alt text.](/images/tung.jpeg "This is a sample image.")

## Links

You may be using [solid-markdown-wasm](https://github.com/zeon256/solid-markdown-wasm).

## Tables

| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Inline code

This web site is using `solid-markdown-wasm`.

# 🔬 Typst Math Mode in markdown!

## 1. Complex Multi-line Equations

### Maxwell's Equations in Differential Form
```math
nabla dot bold(E) &= rho / epsilon_0 \
nabla dot bold(B) &= 0 \
nabla times bold(E) &= -(diff bold(B)) / (diff t) \
nabla times bold(B) &= mu_0 bold(J) + mu_0 epsilon_0 (diff bold(E)) / (diff t)
```

### Schrödinger Equation with Hamiltonian
```math
i planck.reduce (diff Psi(bold(r), t)) / (diff t) = hat(H) Psi(bold(r), t) = [-(planck.reduce^2) / (2m) nabla^2 + V(bold(r), t)] Psi(bold(r), t)
```

## 2. Inline Math Mixed with Text

The quadratic formula $x = (-b plus.minus sqrt(b^2 - 4a c)) / (2a)$ gives us the roots. When $Delta = b^2 - 4a c > 0$, we have two distinct real roots. The golden ratio $phi = (1 + sqrt(5)) / 2 approx 1.618$ appears throughout nature.

Einstein's famous equation $E = m c^2$ shows mass-energy equivalence, where $c approx 3 times 10^8 "m/s"$.

## 3. Matrices and Determinants

### Rotation Matrix
```math
bold(R)(theta) = mat(
  cos theta, -sin theta, 0;
  sin theta, cos theta, 0;
  0, 0, 1
)
```

### Determinant with Absolute Value
```math
det(bold(A)) = abs(mat(a, b; c, d)) = a d - b c
```

## 4. Calculus Heavy

### Triple Integral with Limits
```math
V = integral_0^(2pi) integral_0^pi integral_0^R r^2 sin(theta) dif r dif theta dif phi
```

### Partial Differential Equation (Wave Equation)
```math
(diff^2 u) / (diff t^2) = c^2 ((diff^2 u) / (diff x^2) + (diff^2 u) / (diff y^2) + (diff^2 u) / (diff z^2))
```

### Limits and Series
```math
lim_(n -> infinity) sum_(k=1)^n 1/k^2 = pi^2 / 6
```

## 5. Greek Letters and Special Symbols
```math
alpha, beta, gamma, Delta, epsilon, zeta, eta, Theta, iota, kappa, lambda, mu, nu, xi, Pi, rho, sigma, tau, upsilon, Phi, chi, psi, Omega
```

### Set Theory
```math
A subset.eq B, quad A union B, quad A sect B, quad A \\ B, quad A times B, quad emptyset, quad forall x in A, exists y in B
```

## 6. Nested Fractions and Complex Expressions
```math
x = a_0 + 1 / (a_1 + 1 / (a_2 + 1 / (a_3 + 1 / (a_4 + dots.h))))
```
```math
f(x) = (sqrt(x^2 + sqrt(x^4 + sqrt(x^8 + sqrt(x^16))))) / (1 + (x^2) / (1 + (x^4) / (1 + x^8)))
```

## 7. Cases and Piecewise Functions
```math
f(x) = cases(
  x^2 & "if" x >= 0,
  -x^2 & "if" x < 0,
  0 & "otherwise"
)
```
```math
abs(x) = cases(
  x & "if" x > 0,
  0 & "if" x = 0,
  -x & "if" x < 0
)
```

## 8. Summations and Products

### Fourier Series
```math
f(x) = a_0 / 2 + sum_(n=1)^infinity (a_n cos((n pi x) / L) + b_n sin((n pi x) / L))
```

### Product Notation
```math
product_(k=1)^n k = n! quad "and" quad product_(p "prime")^infinity (1 - 1/p^2)^(-1) = (pi^2) / 6
```

## 9. Vectors and Tensor Notation
```math
bold(v) = vec(v_1, v_2, v_3), quad bold(v) dot bold(w) = sum_(i=1)^3 v_i w_i, quad bold(v) times bold(w) = det(mat(
  bold(i), bold(j), bold(k);
  v_1, v_2, v_3;
  w_1, w_2, w_3
))
```

## 10. Quantum Mechanics Notation

### Dirac Notation
```math
angle.l psi bar.v hat(H) bar.v psi angle.r = integral_(-infinity)^infinity Psi^*(x) hat(H) Psi(x) dif x
```

### Commutator
```math
[hat(x), hat(p)] = hat(x) hat(p) - hat(p) hat(x) = i planck.reduce
```

## 11. Statistical Distributions

### Normal Distribution
```math
f(x | mu, sigma^2) = 1 / (sqrt(2 pi sigma^2)) e^(-(x - mu)^2 / (2 sigma^2))
```

### Bayes' Theorem
```math
P(A | B) = (P(B | A) P(A)) / (P(B)) = (P(B | A) P(A)) / (sum_(i=1)^n P(B | A_i) P(A_i))
```

## 12. Mixed Content with Code

The algorithm runs in $O(n log n)$ time:
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
```

Its recurrence relation is $T(n) = 2T(n/2) + O(n)$.

## 13. Large Operators and Underover
```math
lim_(x -> 0) (sin x) / x = 1, quad 
sum_(i=1)^n i = (n(n+1)) / 2, quad
integral_a^b f(x) dif x = F(b) - F(a)
```

## 14. Aligned Equations
```math
x + y &= 5 \
2x - y &= 1 \
therefore x &= 2, y = 3
```

## 15. Special Functions

### Gamma and Beta Functions
```math
Gamma(z) = integral_0^infinity t^(z-1) e^(-t) dif t, quad 
Beta(p, q) = integral_0^1 t^(p-1) (1-t)^(q-1) dif t
```

## 16. Nested Lists with Math

1. **First Order ODE**: $(dif y) / (dif x) = f(x, y)$
   - Linear: $(dif y) / (dif x) + P(x)y = Q(x)$
   - Separable: $M(x) dif x = N(y) dif y$
   - Exact: $M(x,y) dif x + N(x,y) dif y = 0$ where $(diff M) / (diff y) = (diff N) / (diff x)$

2. **Second Order ODE**: $a (dif^2 y) / (dif x^2) + b (dif y) / (dif x) + c y = 0$
   - Characteristic equation: $a r^2 + b r + c = 0$

## 17. Tables with Math

| Distribution | PDF | Expected Value |
|--------------|-----|----------------|
| Uniform | $f(x) = 1/(b-a)$ | $E[X] = (a+b)/2$ |
| Exponential | $f(x) = lambda e^(-lambda x)$ | $E[X] = 1/lambda$ |
| Poisson | $P(X=k) = (lambda^k e^(-lambda))/(k!)$ | $E[X] = lambda$ |

## 18. Blockquotes with Math

> **Euler's Identity** is considered one of the most beautiful equations:
> 
> ```math
> e^(i pi) + 1 = 0
> ```
> 
> It connects five fundamental mathematical constants: $e$, $i$, $pi$, $1$, and $0$.

> [!WARNING]
> When $abs(z) < 1$, the geometric series converges: $sum_(n=0)^infinity z^n = 1/(1-z)$

## 19. Combining Everything

The **Cauchy-Riemann equations** for a complex function $f(z) = u(x,y) + i v(x,y)$:
```math
(diff u) / (diff x) = (diff v) / (diff y) quad "and" quad (diff u) / (diff y) = -(diff v) / (diff x)
```

When satisfied, $f$ is *holomorphic* and we can compute:

- Line integral: $integral_gamma f(z) dif z = 0$ for closed $gamma$
- Residue: $"Res"(f, z_0) = 1/(2pi i) integral_(abs(z-z_0)=r) f(z) dif z$

### Task List for Complex Analysis

- [x] Learn Cauchy integral theorem: $integral.cont f(z) dif z = 0$
- [x] Study Laurent series: $f(z) = sum_(n=-infinity)^infinity a_n (z-z_0)^n$
- [ ] Master residue theorem: $integral.cont f(z) dif z = 2pi i sum "residues inside" gamma$

## 20. Edge Cases and Advanced Features

### Derivatives with Primes
```math
f'(x) = lim_(h -> 0) (f(x+h) - f(x))/h, quad f''(x), quad f'''(x), quad f^((n))(x)
```

### Accents and Decorations
```math
arrow(v), hat(x), tilde(y), overline(z), dot(x), dot.double(x), dot.triple(x), vec(x, y)
```

Or if you want to show various vector notations:
```math
arrow(v), hat(x), tilde(y), overline(z), dot(x), dot.double(x), dot.triple(x)
```

Here are the key changes:
- `macron(z)` → `overline(z)` 
- `ddot(x)` → `dot.double(x)` (double dot accent)
- `dddot(x)` → `dot.triple(x)` (triple dot accent)
- `vec(delim: #none, x, y)` → `vec(x, y)` (remove the `delim: #none` parameter as that's not standard Typst math syntax)

Would you like me to generate a fully corrected version of the entire stress test with all Typst syntax errors fixed?

### Binomial Coefficients
```math
binom(n, k) = (n!) / (k!(n-k)!) = binom(n, n-k)
```

### Multiline Fractions
```math
frac(
  sum_(i=1)^n x_i,
  n
) = macron(x)
```

Multiple equations in one line: $a^2 + b^2 = c^2$, $E = mc^2$, $F = ma$.

---

**Final Challenge**: Can you render $sqrt(sum_(i=1)^n (x_i - macron(x))^2 / (n-1))$ inline while displaying:
```math
hat(beta) = (bold(X)^top bold(X))^(-1) bold(X)^top bold(y)
```

as a block? 🎯

## 21. Navier-Stokes
```math
rho (diff bold(u)) / (diff t) + rho (bold(u) dot nabla) bold(u) = -nabla p + mu nabla^2 bold(u) + bold(f)
```

## 22. Special Typst Features

### Floor and Ceiling
```math
floor(x), ceil(x), round(x)
```

### Norms
```math
norm(bold(v)) = sqrt(sum_i v_i^2), quad norm(bold(v))_1 = sum_i abs(v_i), quad norm(bold(v))_infinity = max_i abs(v_i)
```

### Underbrace and Overbrace
```math
underbrace(1 + 2 + 3 + dots + n, "sum") = (n(n+1))/2
```
```math
overbrace(x + x + dots + x, n "times") = n x
```