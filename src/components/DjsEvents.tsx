import React from "react";

const DjsEvents = () => {
  return (
    <section className="container mx-auto mt-16 flex flex-col justify-between px-4">
      <h2 className="text-title mb-6 text-3xl">Upcoming Events for DJs</h2>

      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* today */}
        <div className="flex justify-between p-6">
          <p className="flex items-start px-5 text-[100px] font-bold">
            <span className="number">27</span>
            <span className="inline text-base font-thin">AUG</span>
          </p>
          <div className="overscroll-y-auto border-l-2 border-l-[#8951e6] px-5">
            <article className="border-b border-dashed border-b-[#8951e6] py-3 text-xs">
              <div className="mb-4">
                <h5 className="text-lg font-bold">Dj. Echo</h5>
                <p className="text-xs">Estisluna, Sweden</p>
              </div>
              <p className="mb-2">
                <strong>Venue:</strong> Restaurang Grappa Matsal & Bar
              </p>
              <p className="mb-2">
                <strong>Address:</strong> Järntorget 3, 652 24 Estisluna, Sweden
              </p>
              <p className="mb-2">
                <strong>Dress Code:</strong> Dress to impress
              </p>
              <p className="mb-2">
                <strong>Entry Fee:</strong> No
              </p>
            </article>
            <article className="border-b border-dashed border-b-[#8951e6] py-3 text-xs">
              <div className="mb-4">
                <h5 className="text-lg font-bold">Dj. Echo</h5>
                <p className="text-xs">Estisluna, Sweden</p>
              </div>
              <p className="mb-2">
                <strong>Venue:</strong> Restaurang Grappa Matsal & Bar
              </p>
              <p className="mb-2">
                <strong>Address:</strong> Järntorget 3, 652 24 Estisluna, Sweden
              </p>
              <p className="mb-2">
                <strong>Dress Code:</strong> Dress to impress
              </p>
              <p className="mb-2">
                <strong>Entry Fee:</strong> No
              </p>
            </article>
          </div>
        </div>

        {/* tomorrow */}
        <div className="flex p-6">
          <p className="flex items-start px-5 text-[100px] font-bold">
            <span className="number">28</span>
            <span className="inline text-base font-thin">AUG</span>
          </p>
          <div className="overscroll-y-auto border-l-2 border-l-[#8951e6] px-5">
            <article className="border-b border-dashed border-b-[#8951e6] py-3 text-xs">
              <div className="mb-4">
                <h5 className="text-lg font-bold">Dj. Peggy Gou</h5>
                <p className="text-xs">Seoul, South Korea</p>
              </div>
              <p className="mb-2">
                <strong>Venue:</strong> Lit Lounge Itaewon
              </p>
              <p className="mb-2">
                <strong>Address:</strong> 34 Itaewon-ro, Yongsan District, Seoul
              </p>
              <p className="mb-2">
                <strong>Dress Code:</strong> ₩20,000
              </p>
              <p className="mb-2">
                <strong>Entry Fee:</strong> No
              </p>
            </article>
            <article className="border-b border-dashed border-b-[#8951e6] py-3 text-xs">
              <div className="mb-4">
                <h5 className="text-lg font-bold">Dj. Echo</h5>
                <p className="text-xs">Estisluna, Sweden</p>
              </div>
              <p className="mb-2">
                <strong>Venue:</strong> Restaurang Grappa Matsal & Bar
              </p>
              <p className="mb-2">
                <strong>Address:</strong> Järntorget 3, 652 24 Estisluna, Sweden
              </p>
              <p className="mb-2">
                <strong>Dress Code:</strong> Dress to impress
              </p>
              <p className="mb-2">
                <strong>Entry Fee:</strong> No
              </p>
            </article>
          </div>
        </div>

        {/* day after tomorrow */}
        <div className="flex p-6">
          <p className="flex items-start px-5 text-[100px] font-bold">
            <span className="number">29</span>{" "}
            <span className="inline text-base font-thin">AUG</span>
          </p>
          <div className="overscroll-y-auto border-l-2 border-l-[#8951e6] px-5">
            <article className="border-b border-dashed border-b-[#8951e6] py-3 text-xs">
              <div className="mb-4">
                <h5 className="text-lg font-bold">Dj. Vishnu</h5>
                <p className="text-xs">Bangalore, India</p>
              </div>
              <p className="mb-2">
                <strong>Venue:</strong> Nolimmits Lounge & Club
              </p>
              <p className="mb-2">
                <strong>Address:</strong> Ashok Nagar, Bangalore, India
              </p>
              <p className="mb-2">
                <strong>Dress Code:</strong> No Dress Code
              </p>
              <p className="mb-2">
                <strong>Entry Fee:</strong> ₹1500
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DjsEvents;
