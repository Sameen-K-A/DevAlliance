const LeaveModal = ({ isHost, setShowLeaveModal, closeRoom }) => {
   return (
      <div className="leave-modal px-3 py-3">
         <h6 className="text-light p-0 m-0 text-center mb-3" style={{ whiteSpace: "nowrap" }}>Are you sure you want to exit the room?</h6>
         <p className="text-light text-center">{isHost && "Please note, as the host, leaving will close the room for everyone."}</p>
         <div className="d-flex gap-2 justify-content-center align-items-center">
            <button className="btn bg-secondary text-light" onClick={() => setShowLeaveModal(false)}>Cancel</button>
            <button className="btn bg-danger text-light" onClick={closeRoom}>Leave</button>
         </div>
      </div>
   )
}

export default LeaveModal;