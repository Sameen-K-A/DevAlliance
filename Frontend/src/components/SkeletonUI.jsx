import { Skeleton } from '@mui/material';

const SkeletonUI = () => {
   return (
      <div className='d-flex flex-column gap-2 mt-3'>
         <Skeleton variant="rectangular" animation="wave" width="100%" height={50} />
         <Skeleton variant="rectangular" animation="wave" width="100%" height={50} />
         <Skeleton variant="rectangular" animation="wave" width="100%" height={50} />
         <Skeleton variant="rectangular" animation="wave" width="100%" height={50} />
      </div>
   );
}

export default SkeletonUI;