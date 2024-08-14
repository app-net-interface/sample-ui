import DefaultLayout from '@/layout/DefaultLayout';


const NotFound: React.FC = () => {
    return (
        <DefaultLayout>
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-4xl font-bold text-gray-800">404</h1>
                <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
            </div>
        </DefaultLayout >
    );
};

export default NotFound;
