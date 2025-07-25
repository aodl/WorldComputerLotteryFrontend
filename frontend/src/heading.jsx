import PoweredByTheIC from './powered_by_the_ic.jsx';
import TicketInput from './ticket_input.jsx';

export default function Heading() {
  return (
    <div className="heading">
      <PoweredByTheIC />
      <div className="buttons item">
         <div className="item">
           <a href="#" className="button">About</a>
           <div className="mega">
             <div className="mega-inner">
               <div>
                 <h3>Under construction...</h3>
               </div>
             </div>
           </div>
         </div>
         <div className="item">
           <a href="#" className="button" style={{opacity: 1}}>Play</a>
           <TicketInput onValid={(nums) => console.log('valid numbers:', nums)} />
         </div>
         <div className="item">
           <a href="#" className="button">Audit</a>
           <div className="mega">
             <div className="mega-inner">
               <div>
                 <h3>Under construction...</h3>
               </div>
             </div>
           </div>
         </div>
      </div>
      <div className="item hide-on-small-screen" style={{textAlign: 'center'}}>Demo Instance</div>
    </div>  
  );
}
