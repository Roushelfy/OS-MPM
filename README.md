# OS-MPM

Project page for

> Zhaofeng Luo, Minchen Li, Yupeng Jiang.
> **An overlapping Schwarz space-time refinement framework for multi-resolution material point method.**
> *Computational Mechanics* (2026). <https://doi.org/10.1007/s00466-026-02884-6>

**Website:** <https://roushelfy.github.io/OS-MPM/>

OS-MPM couples a coarse background domain and a fine local domain, each with its own grid,
particles and time step, through an overlapping Schwarz iteration. Inside each subdomain the
solver is standard MPM.

## Citation

```bibtex
@article{luo2026osmpm,
  title     = {An overlapping {S}chwarz space-time refinement framework for multi-resolution material point method},
  author    = {Luo, Zhaofeng and Li, Minchen and Jiang, Yupeng},
  journal   = {Computational Mechanics},
  year      = {2026},
  publisher = {Springer},
  doi       = {10.1007/s00466-026-02884-6},
  url       = {https://doi.org/10.1007/s00466-026-02884-6}
}
```

## About this repository

The site is static: `index.html`, one stylesheet, one script, and assets. It has no build step
and loads nothing from external servers.

```
index.html
assets/css/style.css      layout and typography
assets/js/main.js         method stepper, figure tabs, CPU-time chart, lightbox
assets/fig/               figures from the article (SVG, WebP)
assets/video/             animations rendered from the simulation data of the paper's runs
assets/fonts/             Inter, Source Serif 4, JetBrains Mono (SIL Open Font License)
assets/vendor/katex/      KaTeX (MIT License)
```

To preview locally:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Licence

Figures are reproduced from the article, © The Authors 2026, under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The fonts and KaTeX keep their own
licences, included next to the files.
