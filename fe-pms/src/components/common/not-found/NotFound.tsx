'use client';
import { Button, Result } from 'antd';
import Link from 'next/link';
import { RocketIcon } from 'lucide-react';

const NotFoundPage = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Result
            icon={<RocketIcon className="w-24 h-24 animate-bounce text-primary" />}
            title={
                <h1 className="pb-6 text-6xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text">
                    404 - Page Not Found!
                </h1>
            }
            subTitle={
                <p className="text-xl text-gray-500 dark:text-gray-400">
                    Sorry, the page you are looking for dose not exist.
                </p>
            }
            extra={
                <Link href="/">
                    <Button type="primary" size="large" className="mt-4">
                        Go Back Home
                    </Button>
                </Link>
            }
        />
    </div>
);

export default NotFoundPage;
