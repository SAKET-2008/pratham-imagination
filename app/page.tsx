import Hero from "@/components/hero/Hero";
// import FluidWorksTransition from "@/components/hero/FluidWorksTransition";
import CatalogueSection from "@/components/CatalogueSection";
import WorksWheelDemo from "@/components/ui/works-wheel-demo";
// import CameraShutter from "@/components/hero/CameraShutter";

// import card from "@/components/card";
export default function Home() {
  return (
    <main>
      <Hero />
      {/* <FluidWorksTransition /> */}
      {/* <CameraShutter
        works={
          <div className="flex h-full w-full items-center justify-center bg-[#080808] text-white">
            <h1 className="text-[12vw] font-bold tracking-tighter">
              WORKS<span className="text-neutral-500">.</span>
            </h1>
          </div>
        }
        catalogueIntro={
          <div className="flex h-full w-full items-center justify-center bg-[#080808] text-white">
            <h1 className="text-[10vw] font-bold tracking-tighter">
              CATALOGUE<span className="text-neutral-500">.</span>
            </h1>
          </div>
        }
      /> */}

      <CatalogueSection />
            {/* return <card /> */}

      <WorksWheelDemo />
            
      <section className="h-screen bg-[#080808]" />
    </main>
  );
}