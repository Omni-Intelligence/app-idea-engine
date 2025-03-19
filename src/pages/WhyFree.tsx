import { ButtonLink } from "@/components/ui/button-link";

export const WhyFree = () => {
  return (
    <div className="container mx-auto px-4 py-4 lg:py-8 space-y-16">
      <section className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold">Why is App Idea Engine Free?</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          We believe in democratizing technology and showing what's possible with modern development tools.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Democratizing Application Development</h2>
          <p className="text-gray-600 leading-relaxed">
            We're passionate about showing how modern technology has democratized application development. Today, you can build solutions 10x faster and 10x cheaper than ever before. App Idea Engine is a living example of this transformation.
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Empowering Through Education</h2>
          <p className="text-gray-600 leading-relaxed">
            Our mission is to show you what you can build yourself through our learning content, community, and technology. We believe in empowering developers and businesses with the knowledge to create their own solutions.
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Community First</h2>
          <p className="text-gray-600 leading-relaxed">
            We believe in giving back to our community. By making App Idea Engine free, we're enabling creators and businesses of all sizes to experience the power of modern AI technology.
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 hover:border-[#6D42EF] transition-colors">
          <h2 className="text-xl font-semibold mb-3">Powered by Enterprise DNA</h2>
          <p className="text-gray-600 leading-relaxed">
            As part of Enterprise DNA's ecosystem, App Idea Engine showcases our expertise in building enterprise-grade AI solutions. It demonstrates our commitment to innovation and accessibility.
          </p>
        </div>
      </div>

      <section className="space-y-8">
        <h2 className="text-3xl font-semibold text-center">How We Support App Idea Engine</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          While App Idea Engine remains free, we offer premium services and solutions for businesses looking to leverage our expertise and technology:
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-white shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Custom AI Development</h3>
            <p className="text-gray-600 mb-4">
              We build incredible applications leveraging the latest AI technologies, tailored to your specific needs and opportunities.
            </p>
            <ButtonLink href="/https://omniintelligence.co/" variant="outline" target="_blank" className="w-full">
              Learn More
            </ButtonLink>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">White Label Solutions</h3>
            <p className="text-gray-600 mb-4">
              Get your own customized version of App Idea Engine for internal use, with features tailored to your organization's needs.
            </p>
            <ButtonLink href="https://omniintelligence.co/solutions" target="_blank" variant="outline" className="w-full">
              Learn More
            </ButtonLink>
          </div>
          <div className="p-6 rounded-lg bg-white shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">App Idea Engine</h3>
            <p className="text-gray-600 mb-4">
              Explore our other innovative technologies, including our App Idea Engine for generating new application concepts.
            </p>
            <ButtonLink variant="outline" className="w-full">
              Coming Soon
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="text-center space-y-6 bg-[#1A1A1A] text-white p-12 rounded-2xl">
        <h2 className="text-2xl font-semibold">Explore Our Resources</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Discover our extensive collection of learning content, community resources, and technology insights. Learn how to build and innovate with modern tools and AI.
        </p>
        <ButtonLink href="https://enterprisedna.co/" target="_blank" >
          Access Learning Resources
        </ButtonLink>
      </section>
    </div>
  );
};

export default WhyFree; 
