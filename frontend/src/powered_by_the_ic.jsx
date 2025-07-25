import icLogoUrl from '../public/ic-logo.svg?url';

export default function PoweredByTheIC() {  
  return (
    <div className="item">
      <span style={{
        color: 'white',
        fontSize: '0.75em',
        fontFamily: 'Verdana, Arial, sans-serif', 
        display: 'inline-block', 
        marginLeft: 92,
        marginBottom: 4, 
        opacity: 0.7
      }}>
        Powered by the
      </span>
      <br/>
      <img src={icLogoUrl} alt="Internet Computer" width={219} height={40} />
    </div>
  );
}
