const RoomMembersModal = ({ roomMembers }) => {
   return (
      <div className="members-list px-3 pt-2">
         {roomMembers.map((member, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
               <div className="circle bg-secondary d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }} ><b>{member[0]}</b></div>
               <p className="text-light m-0" style={{ whiteSpace: 'nowrap' }}>{member}</p>
            </div>
         ))}
      </div>
   )
}

export default RoomMembersModal;