import '../styles.css';

import type { ReactNode } from 'react';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();

  return (
    <div>
      <meta name="description" content={data.description} />
      <link rel="icon" type="image/png" href={data.icon} />
      <body className="m-0 w-full h-full flex flex-col items-center justify-center gap-4">
        {children}
      </body>
    </div>
  );
}

const getData = async () => {
  const data = {
    description: 'Waku x Integrate',
    icon: '/images/favicon.png',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
