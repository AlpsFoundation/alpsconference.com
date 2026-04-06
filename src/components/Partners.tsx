import { useEffect, useRef } from "react";
import { animate } from "animejs";

const PARTNERS = {
  "Academic Partners": [
    "https://lh3.googleusercontent.com/sitesv/APaQ0STa7uJVqXJd8ozCKnjA21S5pvSmhvHI-y2upbh4GFarIa3ebIrlv5jVBULP9bCWCkfLBOiAnSYMZlFShwGN9jKpiVJjqQ_mfMu4dbGCMw4g_fCPvFfjGYHrjPjq2cpO0r6oeCocyYIR-WYe980Bi90xaiQc58XHwwv-4ZrBg-0UNddP3uFllIBvy8Y=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQlCnMeUykYHqiJCqjszrDVUagXMaLdWCMBAOsRW4ukywixbyd8sqCzVvifW0PtQkMuCaFepXzIfX2hSXBpmwb95L0BWxOnzW8diWD8zyHihLGD5io0NKnimDY3DbqlR2w05XI13Y5WIDRFHUk-mDfLmjYFp1Tlz4_Z0Cg1d4vvQi2N8jxa7bkM=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STyfPiYo4Kw2xIKjeZW5bbKsTLid8Yprv5BT8ff7KJjOBc2dFKv4MBtlMeKzPhFrpQyTcSKqTEkKvnKPn9YgYH5xD62ykZgsCWm_ync5KJZk43vnSfc8HEJn66EswoHQq8nx-J_t_1iXHoWEyhrI0BFLW_GnFup21JppW4vGyoVZ9tge4axBecbIqk=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSG_FUMXj5jsUaE3eaXNF3zbW18Q-AK6l-K-8-vsA7ZjUpE0U7ZMgb72G90qlVE6-SwY8-upL90T4jnaw-FcQBxFo-qlhDDzFMBTWfGN9iDxR8LuEcAEpWqXjPdlOCNauRWx-WL59g1x8Ie3AFOlPFJQiZ6wCGc2y8OSdMDOaUPMlel2dyJbw=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQau9moEIRvMZzzDWL4EKBUjp6jhCeoS5w5e-SbObj6XtUZK3023K3f7R3Wpu4-FDjxroYD9Urn-GatP_8fYoAtwZuuyQXRI-YhcBajT_Vyw01LAgQcgBzV38AA_ckoyxjaPf5nwZTDipzq9QjtpR2zgrHNeS-9uvfDM8D8hLGzJYWHM_gHut5Y=w1280"
  ],
  "Sponsors": [
    "https://lh3.googleusercontent.com/sitesv/APaQ0SR4Kke8Tnd1k-VFKSJgEqJC-mrsOOgMR4OythVTPS6VEG0DIb97bqZCqtmvBiT5I2R-X3CMFny5dyhKM1mVEDfmf_sM4n4mS8lQLNgFgFzL5nETB2ua9pfQODoSDngeywvisNWCBOFuiLQ5OoG46t2xGH9VaR56XK-Delmp2mlLs3ibgAxZ44wAFGrFmYoXaA0t2-LyM-fCHbqswFktshQ8beaMp3Nu-yW4=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSVCiBj6I6hWROXcC0B8iW_5G-P0y-quccV_2t9216I_9BPRe8-fg_IBdTq75trlEoJMv1qjHS_UeSO_JIwp6PDApSJrDF9tvhV2_sPfVBeWTxJI5xTtfChdmsHrMd87keSmtPpJKaLve9EhSG8Yil-GVHtaqDaG4pCSCs8SorN4yGxuZ5d0AugzMjQfiCc1dS7k4QzckFpzWhPGyzUr2rdBIke4tRKuTN2sGo=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSe7wtc0TkTMKOTMQSZope91BRllCLBW3GWbEVVkKCG8TSc-X8iAdV4dEnCk5EpXLzZlNOZEoOGjFoZG38onFb19c3LZScSOjDmaeYDYNdOMF_5tDdJlMUevO5d25DasaVBLHMP3RHb4nN5vcicbXKbkDWSpzUPbynENvra9NENuGZlL4tpZWZfwKx5erfk8mEPHGy_VOKVK3VjlwdTamY7DLSB00XEpI_H-OA=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSBejhyJs1NFANRRMMAY4CX5mi-LiAMWJVZUbTwYhgkyH2SKl6jPkTaErv8y7VVp8KGixirFZq6y-CLHapZSM5KrUw_MsLTgLGsmHheNrV7zIFv1TfekEUeX4XCtMh08SAABrooK07nVUx5t6SeXCkR4mnDtsLc7dKtrw_FfN2v2baW_yoj3jRuK0CZm2PFSuyW9Zyeg1xb7T1TmjxR5b-l17Fcc0DRVpMZtBc=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSYikoVCJRO2Cwr4uOHxT5MU5DsUb0yzjqrbKk602isuGmpG51yR3phmLGBnCKlPVooY1rOah_py1DixycGcu2mV6tkxYq6GGFLerqG6U2vzw0L_OlVva0tEuOsoh2vkxTEToiisL5n1bsvR2iTiVtkKCJT-x9XbpLzNArtaJIPKJuJkKPWiWHpDbORsXJGUuGNBFbzXhf04QEArnZiTgUvqMt9GNwuh_anNaI=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STgwcS2EMyYg57I2ap45DQzSj-UYeIdQfkj_dzDAAHpgqlgYDZcvvmkTzE5jlnTZz_DjpFWSwZ4jZKFW0naboNTZHd5LmPkpCXB7KuI-gr3INcB940mDcRomQKntQq6fy5DrLS_RdOdBziZyT6Sk6MRrpIGQZmrhjDkPk246ilWKQ4gBrhT2YhWyoeZ0LhWaMld3I_Ygk1XsKl0wLMHjXXCqjp5E0jHlhYr=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQlvze7ro_2bob_V-R-eqVhanz73fCmEpnaq-netCHMm-hkxf35GMV9pKhoVx7VGKGc11IaVTGZ3Sc2bC3o8jA2x1IQR8Y0jvZIUwzNDiLmZWJFgmjx-XeCHx0MC-oVM2JhJxBi6eHL8hhdcmru2PEnSGl94ERhw6Rf-zMUyQOkXi6MuY0bTg2WC_ZsrhdGhI1ucgk1X7Jr7fYPe05g_DT0M_nMGpaUZevkPC8=w1280"
  ],
  "Media Partners": [
    "https://lh3.googleusercontent.com/sitesv/APaQ0STBtGeQSj7oc-CniJvJ_s66uaTDv7QhRBC6jS18Sd_2JuwXh-f4_pXoCsvpxxxqmsMB2PkBM2ntZq_-5oqUFTKKTT_QNxByty41AiLn-H8bSuEXPRu-_QxcV02VCC5erqyKQV0MDbYBPOGliMBH-sWVmEZ0x_8T5P80gtAXrjkbRMnzVLDI80y3U7Y=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STX5GOsPYeXecxnYw5BSBYm2eTbjQIGggbclyim0Da9BO7F9NGRG-Ovr_llFagry-rz84079A1J2wySkbL6wjMlUg-dFmwU2kXwqMccp6xcc4aOhupvN4QF1pZm4Y3ESChfz0PFsRw9rTC3HQk45U4Zl6otRb3xpjWfgoVLKo2oggryW_vYKA=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SSclbJ7ENa2JC9e6lZDrNWs6TfhBB2h5K74BYb7HGdAql5qWbS8xuoduKjTDG0SVogxtJRITjgamHiRm380aSZcPnHFaJ3IqPwjS6RmfLs0lpe1Ssw5kZqSYWWawyAv1ne06uQNEpT2GAGiiKTfkcLBGwnD6esB0fj22YruxRKwVEpcR2SpIdFXfPQ=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0STPzFZNIfgrc8hGxfQTwFQFF6YCVAvn3BZvFWvy5hpGc2e4AWRpnhvfvK3K7cOs17m75xgv4JK0m-goc38G-fvhcriIH65a8_eef913UFRstHCTKsodjUTKtZrxyWVTrfbOQeNDEBaqVaU7TZhxaGCw6sac4RhZnk9Pn0jUFTE4U2Bd0Vi0zUfuUO4=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQ5U1l6DVN8WrRjznXUAubIO-kY1RQ0MhmCYVMPcqY6ZQYeGGQcCVhPsXdxHMTkK73D-vNPJ7jyhgGCeqQrVnSk1URgOSi9KTyqRP9XRF2loYXmCpvZ3ogMkDa7xgYY27TDOn_9czHqCGJHPVn3Pssl2gAA6Q6SMdwN8peE3RH4FzgNArMla9HkPj0=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SRD3GNLJQvjD303cwN6EkamkTHCEDR04B5R8Qd7mniyEojE27wZtAHLCY8uK4Lc5cvS5mYbA6_aqc96ZsL3IDZeIe4OpEPAr2v5LsofAXh4w-QtnBD__vPkKvCWMKdvXYeXLJqjYlBthChXBuYvQtlDvb-RVUHtHWCEhkjVaY2gf6O4GsEFHrSggHA=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SQFAfTVIRar-vc6IhLbWyC4IlHHLyONBTtHGUNBmU3Rh7HggrO70xAv_dWXpZMYzbL9374SiEbBhuZpzi7WrzXGRd5Kkni2-vDUhaAA3yEC8EiCtZ-GzeXiKI83V4uHKqqzzdpHFY05i82wi8eTO5ZasdkV4SYrUCNtm0kDX0euxIOpBTWxCTlF2v0=w1280",
    "https://lh3.googleusercontent.com/sitesv/APaQ0SR3NcnHjZe6tM3zKfGZUznXmiKd4KSqn8-DoTbRa5HemHkJ_pMPVa5qW2GY_Dqs0nUHWO3PI5Srd4Pw2CkfsZCVITMl-4pKuPag5EcNuvBLVUDdEYmMX_VGxm5fC1r5hNcI9MCDn7IXjgdE5_y5gqLJ65FZC5xV3t6PCAUejb6U-rYWGeH1uaPq=w1280"
  ]
};

export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [20, 0],
            delay: (_: unknown, i: number) => i * 50,
            duration: 600,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="sponsoring" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-16">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Supported by
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Partners
          </h2>
        </div>

        <div className="space-y-20">
          {Object.entries(PARTNERS).map(([category, logos]) => (
            <div key={category} data-fade-up className="opacity-0">
              <h3 className="text-xl font-medium text-white/90 text-center mb-8">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
                {logos.map((logo, idx) => (
                  <div key={idx} className="flex justify-center p-6 bg-white/[0.03] border border-white/[0.06] rounded-sm hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 aspect-[3/2] items-center">
                    <img
                      src={logo}
                      alt={`${category} logo`}
                      className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity brightness-0 invert"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}