# Home hero imagery

Historical record of PR #20. This treatment was superseded after owner feedback;
see [the current campaign imagery](hero-campaign-imagery.md).

Updated 2026-09-13 KST following the owner's screenshot feedback.

The previous hero used the same unverified local racket render both as a large
background and as a small foreground product. Those files are already rejected
by the catalog's product-photo validation. The hero now uses one static court
scene and the existing verified retail photos on a separate white media surface.

## Published assets

- Background: `public/images/hero/court-editorial-v1.webp`, 1536 × 1024, 195,626 bytes.
- Product: `public/images/customizer/babolat-pure-aero-2026.jpg`, retailer code BPAR26.
- Product: `public/images/customizer/head-speed-mp-2026.jpg`, retailer code HSPMP6.
- Product: `public/images/customizer/yonex-vcore-100-2026.jpg`, retailer code VC108G.

Product mappings retain their existing Tennis Warehouse source links in
`src/data/featured-rackets.ts`. Source model codes are also mapped in
`src/lib/racket-images.ts` and `src/data/racket-score-evidence.ts`.
The product files are reused without recoloring, background removal, or generative
editing. A retailer photo is not evidence of a sponsorship or image-license agreement.

The court background was created with the built-in image generation tool. It is
an original synthetic environmental scene, not a manufacturer campaign or a
photograph documenting an actual venue. Its public caption says
“배경: AI 연출 이미지”; the product links say “제품 사진 출처”.
It contains no racket, person, brand, text, or product specification.
The generated PNG was encoded to WebP at quality 88 without cropping or resizing.
No CLI/API fallback was used. The model identifier was not separately selected.

## Final generation prompt

Use case: ads-marketing. Asset type: photographic website hero background for Racketlab, a premium tennis equipment discovery website. Create a single convincingly photographic, expensive sports editorial campaign scene, landscape 3:2. A real-feeling deep forest-green hard tennis court in late afternoon, close ground-level camera, a sharply tactile slightly worn court surface and one luminous yellow-green unbranded tennis ball positioned on the ground in the right half. A tennis net with a clean cream-white top tape runs diagonally into the far right distance, catching slanting golden natural sunlight; believable net mesh, perspective and long soft shadows. Quiet dark green negative space over the left 55 percent of the image for large white website typography, no visible writing in the image. Keep the striking net and ball photographic interest across the upper and middle-right; natural full tonal range, not almost-black. Premium medium-format commercial sports still-life photography, 80mm lens feel, subtle film grain, physically coherent daylight, authentic rough acrylic court granules and tennis ball felt fibers. Restrained dark green, warm cream and tennis yellow palette. This is an environmental background, product photos are displayed separately by the website. NO tennis racket, NO human, NO product packaging, NO typography, NO brands or logos, NO illustration, NO plastic 3D render, NO synthetic glow, NO collage, NO giant repeated objects, NO watermarks. Deliver a finished photographic image only.
