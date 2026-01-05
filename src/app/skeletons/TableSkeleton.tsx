import React from 'react';
import { Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => {
  return (
    <TableContainer>
      <Table stickyHeader>
        <TableHead sx={{ background: "#E5E5E5" }}>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableCell key={index} sx={{ fontWeight: '600' }}>
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} width="60%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} hover>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" animation="wave" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSkeleton;
