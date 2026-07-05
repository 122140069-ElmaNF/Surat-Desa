type Props = {

title:string;

description:string;

children:React.ReactNode;

};

export default function FormLayout({

title,

description,

children,

}:Props){

return(

<div className="pengajuan-page">

<section className="pengajuan-hero">

<div className="pengajuan-hero-content">

<h1>

{title}

</h1>

<p>

{description}

</p>

</div>

</section>

<section className="pengajuan-content">

<div className="pengajuan-card">

{children}

</div>

</section>

</div>

);

}