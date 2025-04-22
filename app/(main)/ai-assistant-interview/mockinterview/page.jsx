// pages/ai-assistant-interview/mockinterview.jsx
import Agent from '@/components/ui/Agent';
import { auth } from '@clerk/nextjs/server';

const Page = async () => {
  return (
    <div>
      <h1>Mock Interview</h1>
      <Agent userName="You" userId="user1" type="generate" />
    </div>
  );
};

export default Page;