import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { motion } from "motion/react";
import { Appcontext } from "../context/Appcontext";

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [isImageLoaded, setisImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const { generateImage } = useContext(Appcontext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (input) {
      const image = await generateImage(input);
      if (image) {
        setisImageLoaded(true);
        setImage(image);
      }
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      className="flex flex-col min-h-[90vh] justify-center items-center"
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div>
        <div className="relative">
          <img src={image} alt="sample_img_1" className="max-w-sm rounded" />
          <span
            className={`absolute h-1 bg-blue-500 bottom-0 left-0  ${
              loading ? "w-full transition-all duration-[10s]" : "w-0"
            }`}
          />
        </div>
        <p className={loading ? "" : "hidden"}>Loading...</p>
      </div>

      {!isImageLoaded && (
        <div className="flex w-full max-w-xl bg-neutral-500 text-white text-sm p-0.5 mt-10 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Describe What You Want To Generate"
            className="flex-1 bg-transparent outline-none ml-8 max-sm:w-20 placeholder-color"
          />
          <button
            type="submit"
            className={`bg-zinc-900 px-10 sm:px-16 py-3 rounded-full ${
              loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            Generate
          </button>
        </div>
      )}

      {isImageLoaded && (
        <div className="flex gap-2 flex-wrap justify-center text-white text-sm p-0.5 mt-10 rounded-full">
          <p
            onClick={() => setisImageLoaded(false)}
            className="bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer"
          >
            Generate Another
          </p>
          <a
            href={image}
            className="bg-zinc-900 px-10 py-3 rounded-full cursor-pointer"
            download
          >
            Download
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default Result;
