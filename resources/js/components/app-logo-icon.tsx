import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/img/margin-logo.png"
            alt="Margin logo"
            className={`rounded-md object-cover ${className ?? ''}`.trim()}
            {...props}
        />
    );
}
