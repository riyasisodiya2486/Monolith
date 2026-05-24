import { 
  motion, 
  useMotionTemplate, 
  useScroll, 
  useTransform, 
  useAnimationFrame, 
  useMotionValue, 
  useSpring, 
  useMotionValueEvent, 
  AnimatePresence 
} from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import OrbitImages from './components/OrbitImages';
import AnimatedHeading from './components/AnimatedHeading';
import FadeIn from './components/FadeIn';

const orbitHouseData = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    label: "Nordic Retreat",
    headline: "Nordic Retreat",
    description: "Sleek basalt columns integrated with native larch panels and a towering stone hearth."
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    label: "Pacific Villa",
    headline: "Pacific Villa",
    description: "Vast cantilevered volumes projecting over high cliffs, capturing absolute blue horizon views."
  },
  {
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    label: "Slate Estate",
    headline: "Slate Estate",
    description: "Heavily textured slate walls contrasting with delicate white oak and polished brass accents."
  },
  {
    src: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    label: "Glass Pavilion",
    headline: "Glass Pavilion",
    description: "A frame of carbon steel housing a grid of light. Structural transparency refined."
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    label: "Brutalist Oasis",
    headline: "Brutalist Oasis",
    description: "Exposed raw aggregate concrete casting geometric silhouettes against wild terracotta soil."
  },
  {
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    label: "Canyon Heights",
    headline: "Canyon Heights",
    description: "Carved deep into sand cliffs, optimizing prevailing wind currents and geothermal layers."
  },
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    label: "Stone Sanctuary",
    headline: "Stone Sanctuary",
    description: "Ancient masonry methods adapted for contemporary modular layouts on remote ridges."
  }
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Update a real-time system clock formatted beautifully in the footer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " GMT");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Track scroll position to unmount/hide navbar and first page headings cleanly & completely
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsScrolled(latest > 0.03);
  });

  // Smooth out the scroll progress to make ALL scroll animations silky-smooth and remove lagging!
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 38,
    mass: 0.4,
    restDelta: 0.0001
  });

  // Camera-Aperture Zoom-in clip path mask (ellipse starts at 0% and expands to 55%) driven by smooth spring
  const rx = useTransform(smoothProgress, [0, 0.08, 1], ["0%", "55%", "55%"]);
  const ry = useTransform(smoothProgress, [0, 0.08, 1], ["0%", "55%", "55%"]);
  const clipPath = useMotionTemplate`ellipse(${rx} ${ry} at 50% 50%)`;

  // Dynamic visual states for the zooming white container text - optimized & silky smooth
  const textOpacity = useTransform(smoothProgress, [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1], [0, 1, 1, 0, 0, 1, 1]);
  const yElement = useTransform(smoothProgress, [0.03, 0.08, 0.15, 0.22, 0.90, 0.98, 1], [20, 0, 0, 20, 20, 0, 0]);

  const targetRadius = 560;
  
  // High-performance orbit translations mapped to smoothed progress values - Optimized sizing
  const orbitItemSize = useTransform(smoothProgress, [0.15, 0.25, 0.85, 0.95, 1], [80, 440, 440, 80, 80]);
  const orbitRx = useTransform(smoothProgress,       [0.15, 0.25, 0.85, 0.95, 1], [330, targetRadius, targetRadius, 330, 330]);
  const orbitRy = useTransform(smoothProgress,       [0.15, 0.25, 0.85, 0.95, 1], [140, targetRadius, targetRadius, 140, 140]);
  const orbitRotation = useTransform(smoothProgress, [0.15, 0.25, 0.85, 0.95, 1], [-15, 0, 0, -15, -15]);
  const orbitTx = useTransform(smoothProgress,       [0.15, 0.25, 0.85, 0.95, 1], [0, -targetRadius, -targetRadius, 0, 0]);
  const focusStrength = useTransform(smoothProgress, [0.15, 0.25, 0.85, 0.95, 1], [0, 1, 1, 0, 0]);

  const orbitProgress = useMotionValue(0);
  const prevScroll = useRef(0);

  useAnimationFrame((time, delta) => {
     const pos = smoothProgress.get();
     const scrollDelta = pos - prevScroll.current;
     prevScroll.current = pos;

     let frameSpeed = 0;
     if (pos > 0.15 && pos < 0.85) {
        frameSpeed = (scrollDelta * 200); 
     } else {
        frameSpeed = (delta / 1000) * 2.5; 
     }

     orbitProgress.set(orbitProgress.get() + frameSpeed);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full bg-[#fbfbfa]" style={{ WebkitFontSmoothing: 'antialiased' }}>
      
      {/* Dynamic Interactive Navigation Bar - ONLY visible on the first page, fades out cleanly under and past scroll */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-[100]"
          >
            {/* Logo Brand Title with pristine weights and style */}
            <div className="flex items-start select-none leading-none cursor-pointer text-slate-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
              <span className="text-[32px] md:text-[40px] font-medium leading-none">MONOLITH</span>
              <span className="text-[12px] md:text-[14px] ml-1 mt-0.5 font-semibold">©</span>
            </div>

            {/* Premium Desktop Links */}
            <nav className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-slate-800">
              <a href="#villas" className="hover:text-black transition-colors">Villas</a>
              <a href="#concept" className="hover:text-black transition-colors">Philosophy</a>
              <a href="#spaces" className="hover:text-black transition-colors">Exclusive Spaces</a>
            </nav>

            {/* Call-to-Action & Custom Hamburger menu */}
            <div className="flex items-center gap-4">
              <button className="hidden sm:inline-block border border-slate-900 hover:bg-slate-900 hover:text-white transition-colors duration-300 rounded-full px-5 py-2 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-sans font-bold cursor-pointer text-slate-900">
                INQUIRE NOW
              </button>
              <button className="group relative flex items-center justify-center w-[72px] h-[44px] hover:scale-105 transition-transform duration-300 cursor-pointer" aria-label="Menu">
                <div className="absolute inset-0 bg-slate-900 opacity-5 rounded-[50%] -rotate-15"></div>
                <div className="absolute inset-0 bg-slate-900 rounded-[50%] -rotate-15 group-hover:bg-black transition-colors"></div>
                <svg className="relative z-10" width="24" height="10" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1H23M1 9H23" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* SECTION 0: STICKY GALLERY SCREEN SCENE (Length: 450vh) */}
      <div ref={containerRef} className="relative w-full h-[450vh] bg-black">
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          
          {/* Background video layer rendered clean with no color overlay */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4" 
              type="video/mp4" 
            />
          </video>

          {/* Dynamic Watermark Header Title */}
          <div className="absolute z-10 w-[80vw]" style={{ left: '3vw', bottom: '3vw' }}>
            <svg viewBox="0 10 350 72" className="w-full h-auto drop-shadow-sm overflow-visible" preserveAspectRatio="xMinYMax meet">
              <text x="-3" y="80" fontFamily="'Instrument Serif', serif" fill="#0f172a" className="select-none font-medium opacity-90">
                <tspan fontSize="90">MONOLITH</tspan>
                <tspan fontSize="28.8" dx="4" dy="-40">©</tspan>
              </text>
            </svg>
          </div>

          {/* Dynamic masking gallery overlay */}
          <motion.div 
            className="absolute z-20 flex items-center justify-center overflow-hidden"
            style={{ clipPath, rotate: -15, width: '150vw', height: '150vh', left: '-25vw', top: '-25vh' }}
          >
            <div className="absolute inset-0 bg-[#fbfbfa]" />
            <div className="relative flex flex-col items-center justify-center" style={{ width: '100vw', height: '100vh', transform: 'rotate(15deg)' }}>
              <motion.div className="w-[90vw] max-w-[1250px] aspect-square relative z-0">
                <OrbitImages
                  images={orbitHouseData}
                  shape="ellipse"
                  direction="normal"
                  duration={40}
                  fill={true}
                  showPath={false}
                  responsive={true}
                  baseWidth={800}
                  progressOverride={orbitProgress}
                  radiusXOverride={orbitRx}
                  radiusYOverride={orbitRy}
                  itemSizeOverride={orbitItemSize}
                  rotationOverride={orbitRotation}
                  translateXOverride={orbitTx}
                  focusStrength={focusStrength}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Front Section Hero Content - ONLY visible on first page, fades perfectly on scroll */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div 
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -45 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-x-0 bottom-[32vh] md:bottom-[36vh] px-6 md:px-16 z-30 flex flex-col items-center text-center select-none"
              >
                {/* Tagline */}


                {/* Heading with exquisite layout pairings - perfectly spaced and grammatically sound */}
                <h1 className="font-serif text-[42px] sm:text-[64px] md:text-[82px] leading-[0.95] tracking-tight mb-6 max-w-5xl text-slate-950 font-medium">
                  Where Raw Elements Meet <br className="hidden sm:inline" />
                  The <span className="font-script text-[46px] sm:text-[72px] md:text-[92px] text-stone-900 italic normal-case inline-block">Infinite Canvas</span>
                </h1>


                {/* Enter Signal indicator */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-stone-900 font-extrabold animate-pulse">
                    Scroll to contemplate
                  </span>
                  <div className="w-[1px] h-12 bg-gradient-to-b from-stone-900 via-stone-800/55 to-transparent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The interactive masked collection gallery is clean, focused, and elegant */}
          
          {/* Foreground Content with Interactive Layers (Becomes active inside white aperture) */}
          <div className="absolute inset-0 z-[60] pointer-events-none">
            
              {/* Center Heading Section */}
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 text-center flex flex-col items-center">
                <motion.div 
                  className="flex flex-col items-center whitespace-nowrap pointer-events-auto"
                  style={{ opacity: textOpacity, WebkitFontSmoothing: 'antialiased', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                >
                  <div className="flex items-baseline leading-none mb-1 text-black">
                    <span className="font-serif text-[45px] md:text-[55px] italic tracking-tight text-black inline-block">
                      <AnimatedHeading text="M" delay={100} charDelay={40} className="inline-block" />
                    </span>
                    <AnimatedHeading
                      text="aster the Elements"
                      delay={140}
                      charDelay={40}
                      className="font-serif text-[45px] md:text-[55px] tracking-tight text-black select-none inline-block ml-[2px]"
                    />
                  </div>
                  <AnimatedHeading
                    text="embrace"
                    delay={800}
                    charDelay={40}
                    className="font-sans text-[28px] md:text-[36px] tracking-tight text-black mt-[-5px] select-none text-center"
                  />
                </motion.div>
              </div>

              {/* Bottom Left Collection Info */}
              <motion.div 
                className="absolute bottom-8 left-8 md:bottom-16 md:left-16 flex flex-col items-start text-black pointer-events-auto cursor-text"
                style={{ y: yElement, opacity: textOpacity }}
              >
                <FadeIn delay={500} duration={700}>
                  <span className="font-serif text-[40px] leading-none mb-1 text-black font-medium">0651</span>
                </FadeIn>
                <FadeIn delay={700} duration={900}>
                  <span className="font-serif text-[16px] uppercase tracking-widest text-black">COLLECTION</span>
                </FadeIn>
              </motion.div>

              {/* Bottom Right Description & CTA */}
              <div className="absolute bottom-16 right-[6vw] md:right-[10vw] flex flex-col items-start z-10 pointer-events-auto">
                <FadeIn delay={600} duration={800} className="flex flex-col items-start">
                  <motion.p 
                    className="font-serif text-[16px] uppercase tracking-widest text-black leading-[20px] mb-6 text-left w-[240px] cursor-text"
                    style={{ y: yElement, opacity: textOpacity }}
                  >
                    JOIN AN EXCLUSIVE COMMUNITY OF SAILORS. WHETHER YOU CRAVE THE THRILL OF THE OPEN
                  </motion.p>
                  <motion.div className="flex gap-0 pointer-events-auto items-center" style={{ y: yElement, opacity: textOpacity }}>
                    <button className="bg-black hover:bg-black/90 transition-colors text-white rounded-[40px] px-8 py-3.5 font-serif tracking-[0.1em] uppercase text-[12px] md:text-[14px] z-10 cursor-pointer">
                      BUY COLLECTION
                    </button>
                    <button className="bg-black hover:bg-black/90 transition-colors w-[46px] h-[46px] flex items-center justify-center rounded-[50%] text-[#faf9f6] -ml-2 z-0 cursor-pointer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </motion.div>
                </FadeIn>
              </div>
          </div>

        </div>
      </div>

      {/* SECTION 1: ARCHITECTURAL PHILOSOPHY & CONCEPT (Awwwards Editorial Layout) */}
      <section id="concept" className="relative w-full py-28 md:py-40 px-6 md:px-20 bg-[#f7f6f4] border-t border-stone-200 z-50">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Indicator */}
          <div className="flex items-center gap-4 mb-16">
            <span className="font-serif text-[38px] text-slate-800 leading-none">01</span>
            <div className="h-[1px] w-20 bg-stone-300" />
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-stone-500">The Conception</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* Split Column Left: Massive Editorial Headings & Detailed Prose */}
            <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-8">
              <h2 className="font-serif text-[42px] sm:text-[60px] md:text-[76px] leading-[1.0] text-slate-950 tracking-tight mb-8">
                Carving Spaces <br />
                Into the Edge of the <br />
                <span className="italic block font-normal text-stone-800">Canyon Rim.</span>
              </h2>
              
              <p className="font-sans text-[16px] md:text-[18px] text-slate-800 leading-relaxed font-normal mb-8 max-w-xl">
                Every MONOLITH residence is conceived as a physical dialog between geological permanence and atmospheric fluidity. We reject standard ornaments, opting instead for monolithic cast concrete, raw limestone blocks, and vast structural cantilevers.
              </p>

              <p className="font-sans text-[14px] leading-relaxed text-stone-600 max-w-lg mb-12">
                By orienting major axes parallel to oceanic currents, the internal wind paths naturally cycle, allowing occupants to experience the elements unfiltered. The line between interior architecture and wild horizon simply ceases to exist.
              </p>

              {/* Mini Coordinate Details */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-stone-300/60 w-full sm:w-[90%] font-mono text-[11px] text-slate-600 uppercase">
                <div>
                  <span className="block text-slate-400 font-bold mb-1 opacity-80">COORDINATE AXIS</span>
                  <span className="font-medium text-slate-900 font-mono">31.9142° N, 115.8601° E</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold mb-1 opacity-80">GEOMORPHOLOGY</span>
                  <span className="font-medium text-slate-900 font-mono">SILICATE SEDIMENT CANYON</span>
                </div>
              </div>
            </div>

            {/* Split Column Right: Curated Parallax Media Card */}
            <div className="lg:col-span-5 relative w-full pt-4 lg:pt-16">
              <div className="relative group w-full aspect-[4/5] rounded-[24px] overflow-hidden bg-stone-800 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" 
                  alt="Minimalist concrete villa interior with slate rocks" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                
                {/* Embedded floating callout card */}
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#FDFFB7]/95 block mb-2">
                    ACTIVE PROJECT
                  </span>
                  <h4 className="font-serif text-[26px] leading-none mb-1 font-medium text-white">
                    Brutalist Oasis — I
                  </h4>
                  <p className="font-sans text-[11px] text-stone-300">
                    Canyons of clay, ocean of crystalline sapphire. Fully completed 2K26.
                  </p>
                </div>
              </div>

              {/* Side Floating specification pill */}
              <div className="absolute -top-6 -right-3 md:-right-6 w-32 h-32 hidden sm:flex flex-col items-center justify-center rounded-full bg-slate-950 text-white p-4 text-center shadow-2xl rotate-12 hover:rotate-3 transition-transform duration-500">
                <span className="text-[9px] uppercase tracking-widest text-slate-300">CURATED</span>
                <span className="font-serif text-[20px] font-medium leading-tight">LIMITED EDITION</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: CURATED COLLECTION DIRECTORY (Bento Grid of Villas) */}
      <section id="villas" className="relative w-full py-28 md:py-40 px-6 md:px-20 bg-white z-50">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="font-serif text-[38px] text-slate-800 leading-none">02</span>
                <div className="h-[1px] w-20 bg-stone-300" />
                <span className="font-sans text-[11px] uppercase tracking-[0.3em] font-bold text-[#b5a782]">The Collection</span>
              </div>
              <h2 className="font-serif text-[42px] sm:text-[56px] text-slate-950 font-medium leading-[1.0] tracking-tight">
                Curated Living Directives.
              </h2>
            </div>
            <p className="font-sans text-[14px] md:text-[15px] text-stone-600 max-w-sm leading-relaxed">
              Explore the individual architectural profiles available for custom commissions and placement worldwide.
            </p>
          </div>

          {/* Directory Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Villa Card 1 */}
            <div className="flex flex-col group cursor-pointer">
              <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-[#fafaf9] shadow-lg mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                  alt="Nordic Retreat Villa" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-[#FDFFB7] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  REF. // 001
                </div>
              </div>
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-3 mb-3">
                <h3 className="font-serif text-[28px] text-slate-950 font-medium group-hover:text-stone-700 transition-colors">
                  Nordic Retreat
                </h3>
                <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-stone-400">
                  920 SQM
                </span>
              </div>
              <span className="font-mono text-[11px] text-stone-500 uppercase tracking-widest leading-none mb-1">
                LARCH / GRANITE / RAW STEEL
              </span>
              <p className="font-sans text-[12.5px] text-stone-600 leading-relaxed">
                Nestled on high mountain margins, featuring triple-glazed panoramic glass facades and an integrated volcanic boulder hearth.
              </p>
            </div>

            {/* Villa Card 2 */}
            <div className="flex flex-col group cursor-pointer">
              <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-[#fafaf9] shadow-lg mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                  alt="Pacific Villa" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-[#FDFFB7] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  REF. // 002
                </div>
              </div>
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-3 mb-3">
                <h3 className="font-serif text-[28px] text-slate-950 font-medium group-hover:text-stone-700 transition-colors">
                  Pacific Villa
                </h3>
                <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-stone-400">
                  1,240 SQM
                </span>
              </div>
              <span className="font-mono text-[11px] text-stone-500 uppercase tracking-widest leading-none mb-1">
                TRAVERTINE / TEAK / CEMENT
              </span>
              <p className="font-sans text-[12.5px] text-stone-600 leading-relaxed">
                Sculpted lines extending dramatically over cliffs. Includes a dual tier saltwater collection pool flowing seamlessly into the blue sea.
              </p>
            </div>

            {/* Villa Card 3 */}
            <div className="flex flex-col group cursor-pointer">
              <div className="w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-[#fafaf9] shadow-lg mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80" 
                  alt="Slate Estate" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-[#FDFFB7] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  REF. // 003
                </div>
              </div>
              <div className="flex items-baseline justify-between border-b border-stone-200 pb-3 mb-3">
                <h3 className="font-serif text-[28px] text-slate-950 font-medium group-hover:text-stone-700 transition-colors">
                  Slate Estate
                </h3>
                <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-stone-400">
                  1,410 SQM
                </span>
              </div>
              <span className="font-mono text-[11px] text-stone-500 uppercase tracking-widest leading-none mb-1">
                BASALT ROCK / POLISHED BRASS
              </span>
              <p className="font-sans text-[12.5px] text-stone-600 leading-relaxed">
                A massive layout utilizing heavy split-face basalt columns. Inside, a cathedral-height library spans three floating wood levels.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: EDITORIAL AWWWARDS-GRAND FOOTER */}
      <footer className="relative w-full bg-slate-950 text-[#faf9f6] pt-32 pb-16 px-6 md:px-20 overflow-hidden z-50 font-sans">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Footer Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-stone-800 pb-20 mb-16">
            
            {/* Column 1: Core tagline */}
            <div className="md:col-span-5 flex flex-col items-start pr-4">
              <h3 className="font-serif text-[42px] md:text-[54px] leading-[1.0] text-slate-100 italic font-normal tracking-tight mb-6">
                Let us build your <br className="hidden sm:inline" />
                sanctuary.
              </h3>
              <p className="font-sans text-[13px] text-stone-400 max-w-sm leading-relaxed mb-8">
                All models are configured for dynamic architectural fitting across coastal, mountainous, or canyon cliffs. Contact our design workshop to begin.
              </p>
              <div className="group flex items-center gap-4 cursor-pointer pointer-events-auto">
                <div className="bg-white text-slate-950 text-[11px] uppercase font-bold tracking-[0.2em] px-8 py-4 rounded-full group-hover:bg-slate-200 transition-colors">
                  START COMMISION
                </div>
                <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center text-white group-hover:border-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 2: Links Directives */}
            <div className="md:col-span-3">
              <span className="block font-mono text-[10px] text-stone-500 tracking-[0.2em] uppercase mb-6">
                COLLECTION DIRECTIVES
              </span>
              <ul className="space-y-4 font-sans text-[13px] text-stone-300">
                <li><a href="#villas" className="hover:text-white transition-colors">Ref. #001 — Nordic Retreat</a></li>
                <li><a href="#villas" className="hover:text-white transition-colors">Ref. #002 — Pacific Villa</a></li>
                <li><a href="#villas" className="hover:text-white transition-colors">Ref. #003 — Slate Estate</a></li>
                <li><a href="#concept" className="hover:text-white transition-colors">Theory & Conception</a></li>
                <li><a href="#journal" className="hover:text-[#FDFFB7] transition-colors flex items-center gap-2">Interactive Journal <span className="text-[9px] bg-stone-800 text-stone-300 font-mono px-1.5 py-0.5 rounded">NEW</span></a></li>
              </ul>
            </div>

            {/* Column 3: Workshop Locations */}
            <div className="md:col-span-2">
              <span className="block font-mono text-[10px] text-stone-500 tracking-[0.2em] uppercase mb-6">
                WORKSHOPS
              </span>
              <ul className="space-y-4 font-sans text-[13px] text-stone-400 font-medium">
                <li>Copenhagen, DK</li>
                <li>Santa Monica, CA</li>
                <li>Tasmania, AU</li>
                <li>Kyoto, JP</li>
              </ul>
            </div>

            {/* Column 4: System Telemetry */}
            <div className="md:col-span-2 flex flex-col items-start justify-between h-full">
              <div>
                <span className="block font-mono text-[10px] text-stone-500 tracking-[0.2em] uppercase mb-6">
                  GLOBAL TIME
                </span>
                <span className="font-mono text-[15px] block font-bold tracking-wider text-[#FDFFB7]">
                  {currentTime || "16:37 GMT"}
                </span>
                <span className="font-mono text-[10px] text-stone-500 block mt-1 uppercase">
                  LATITUDE 31.95° S
                </span>
              </div>
            </div>

          </div>

          {/* Core Wordmark: Gigantic Editorial text "MONOLITH" filling the width screen */}
          <div className="w-full relative mb-12 select-none pointer-events-none">
            <h1 className="font-serif text-[15vw] leading-none text-stone-900/60 text-center tracking-tighter hover:text-stone-900 transition-colors duration-1000 uppercase">
              MONOLITH
            </h1>
          </div>

          {/* Bottom copyright and structural indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-stone-500 pt-8 border-t border-stone-900 gap-4">
            <div className="flex items-center gap-6">
              <span>MONOLITH ARCHITECTS © 2K26</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">ALL RIGHTS RESERVED TO COMMISSION SPECIFICATIONS</span>
            </div>
            <button 
              onClick={scrollToTop}
              className="group flex items-center gap-2 tracking-[0.15em] uppercase text-stone-400 hover:text-white transition-colors font-bold cursor-pointer"
            >
              Back to Top
              <span className="w-6 h-6 rounded-full border border-stone-800 flex items-center justify-center group-hover:bg-white group-hover:text-slate-950 transition-all font-sans">
                ↑
              </span>
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
