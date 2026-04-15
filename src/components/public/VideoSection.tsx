"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

const YOUTUBE_ID = "mxZWE7sXwOg";

export function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-wt-off-white py-20 sm:py-24">
      <div className="mx-auto max-w-wt-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-wt-heading text-xs font-semibold uppercase tracking-[0.22em] text-wt-primary">
            Quem faz a Welcome
          </p>
          <h2 className="mt-4 font-wt-heading text-3xl font-bold tracking-tight text-wt-teal-deep sm:text-4xl">
            Carreiras que transformam pessoas
          </h2>
          <p className="mt-4 text-base leading-relaxed text-wt-gray-700">
            Conheça um pouco da nossa história pela voz de quem constrói ela
            todos os dias.
          </p>
        </div>

        <div className="relative mx-auto mt-12 aspect-video max-w-4xl overflow-hidden rounded-wt-lg shadow-wt-lg">
          {playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
              title="Welcome Group"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-wt-teal-deep"
              aria-label="Reproduzir vídeo"
            >
              <Image
                src={`https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`}
                alt="Vídeo institucional Welcome Group"
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover opacity-90 transition-opacity group-hover:opacity-75"
                unoptimized
              />
              <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-wt-orange shadow-wt-lg transition-transform group-hover:scale-110">
                <Play className="ml-1 h-8 w-8 fill-white text-white" />
              </span>
            </button>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/vagas"
            className="inline-flex items-center gap-3 rounded-wt-sm bg-wt-orange px-8 py-3.5 font-wt-heading text-sm font-bold uppercase tracking-[0.05em] text-white shadow-wt-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-wt-orange/90 hover:shadow-wt-md"
          >
            Quero fazer parte
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
