'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProjectActionButtonsProps {
    title: string;
    authorEmail: string | null;
}

export default function ProjectActionButtons({ title, authorEmail }: ProjectActionButtonsProps) {
    const handleContactAuthor = () => {
        const email = authorEmail || 'contact@cofundry.com';
        const subject = encodeURIComponent(`Regarding: ${title}`);
        window.location.href = `mailto:${email}?subject=${subject}`;
    };

    return (
 <div className="mt-6 space-y-4">
  {/* Contact Author */}
  <div onClick={handleContactAuthor} className="cursor-pointer">
    <Button className="w-full py-6 text-base font-medium bg-black text-white shadow-md transition-none">
      <span className="inline-block">Contact Author</span>
    </Button>
  </div>

  {/* Apply Now */}
  <Link href="/dashboard" className="block">
    <Button className="w-full py-6 text-base font-medium bg-black text-white shadow-md transition-none">
      <span className="inline-block">Apply Now</span>
    </Button>
  </Link>
</div>
    );
}