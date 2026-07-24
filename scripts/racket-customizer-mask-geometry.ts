import type { MaskGeometry } from "./lib/racket-customizer-mask-builder";

export const RACKET_CUSTOMIZER_MASK_GEOMETRIES = [
  {
    slug: "babolat-pure-aero-2026",
    productCode: "BPAR26",
    canvas: { width: 500, height: 858 },
    stringBed: {
      cx: 337,
      cy: 235,
      rx: 144,
      ry: 185,
      rotationDeg: 0,
      mains: 16,
      crosses: 19,
      inset: 7,
    },
    gripPaths: [
      "M71 608 C79 603 99 603 105 608 C107 649 108 707 112 766 C113 788 119 807 112 818 C101 826 75 827 62 816 C65 788 63 746 64 700 C64 653 64 622 71 608 Z",
      "M319 607 C328 603 345 603 350 608 C350 653 352 708 355 765 C356 788 364 807 357 818 C346 825 324 825 312 816 C315 785 314 744 315 700 C315 652 314 622 319 607 Z",
    ],
  },
  {
    slug: "head-gravity-mp-2025",
    productCode: "HGMPG",
    canvas: { width: 500, height: 857 },
    stringBed: {
      cx: 331,
      cy: 216,
      rx: 151,
      ry: 191,
      rotationDeg: 0,
      mains: 16,
      crosses: 20,
      inset: 7,
    },
    gripPaths: [
      "M77 596 C85 591 101 591 107 597 C108 646 110 704 113 770 C114 791 121 813 113 823 C101 831 76 831 64 821 C68 791 66 748 66 701 C66 651 66 614 77 596 Z",
      "M316 597 C325 592 341 592 347 598 C348 648 350 704 354 770 C355 792 363 812 356 823 C344 830 321 830 311 820 C314 790 313 747 313 701 C313 648 312 614 316 597 Z",
    ],
  },
  {
    slug: "yonex-ezone-100-2025",
    productCode: "EZ10BB",
    canvas: { width: 500, height: 857 },
    stringBed: {
      cx: 336.5,
      cy: 229,
      rx: 146,
      ry: 189,
      rotationDeg: 0,
      mains: 16,
      crosses: 19,
      inset: 7,
      innerRimPath: "M277 48 C248 55 218 75 204 107 C193 133 192 171 193 229 C194 293 205 347 235 388 C259 420 291 425 336.5 425 C382 425 414 420 438 388 C468 347 479 293 480 229 C481 171 480 133 469 107 C455 75 425 55 396 48 C365 42 308 42 277 48 Z",
    },
    gripPaths: [
      "M73 588 C81 584 99 584 105 590 C106 641 108 700 111 766 C112 789 118 809 112 820 C101 829 75 829 62 819 C65 787 63 744 64 699 C64 646 64 606 73 588 Z",
      "M315 590 C324 586 341 586 348 592 C349 644 351 703 354 767 C355 790 363 810 357 821 C345 830 321 829 310 819 C314 788 312 745 313 699 C313 645 312 607 315 590 Z",
    ],
  },
] as const satisfies readonly MaskGeometry[];
