# 索思科技协会Official Website
This website is under construction...
Powered by Astro blog(CapsuleX[https://github.com/wangjacks/capsule-x])


## Member blog data

The Blogs and Members pages use mirrored data from
[Planet-Source-of-USTB](https://github.com/Source-of-USTB/Planet-Source-of-USTB).

```bash
npm run sync:planet
```

A GitHub Actions workflow runs this every 6 hours and commits changes under
`src/data/planet/` and `public/planet/avatars/`.
