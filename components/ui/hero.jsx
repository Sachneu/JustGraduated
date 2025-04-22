import Image from "next/image";
import Link from "next/link";
import { Button } from "./button";

const HeroSection = () => {
  return (
    <section>
      <div className="text-center mt-30">
        <div>
          <h2 className="text-5xl font-bold text-black dark:text-white">
            Start your career <br /> journey here
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-lg mx-auto">
            An AI-powered career coach to help you optimize your resume, prepare
            for interviews, and land your dream job.
          </p>
        </div>
  
        <div className="py-19">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 cursor-pointer">
              {" "}
              Get Started
            </Button>
          </Link>
        </div>

        <div> 
            <div>
                <Image
                src={"/bg.png"}
                width={700}
                height={600}
                alt="Banner JG" 
                className=" mx-auto"/>
            </div>
        </div>
      </div>
    </section>

    

    
  );
};

export default HeroSection;
