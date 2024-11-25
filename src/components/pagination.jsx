import React, { useState } from 'react';
import ReactPaginate from 'react-paginate';

function PaginatedItems({ itemsPerPage, arrItems, itemsRender, setItems, msjEmpty }) {
    const [itemOffset, setItemOffset] = useState(0);
    const [pageForceSelected, setPageForceSelected] = useState(0);
    
    const endOffset = itemOffset + itemsPerPage;
    const currentItems = arrItems.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(arrItems.length / itemsPerPage);
    
    if(arrItems.length > 0 && currentItems.length===0){
        setItemOffset(itemOffset-itemsPerPage);
        setPageForceSelected(pageCount-1);
    }

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % arrItems.length;
        setItemOffset(newOffset);
    };
    
    return (
        <>
            {React.createElement(itemsRender, { currentItems, setItems, msjEmpty })}
            {arrItems.length > itemsPerPage && (
                <ReactPaginate
                    breakLabel="..."
                    nextLabel=">"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={4}
                    pageCount={pageCount}
                    previousLabel="<"
                    renderOnZeroPageCount={null}
                    containerClassName='pagination'
                    pageLinkClassName='page-num'
                    previousClassName='previous'
                    nextClassName='next'
                    activeLinkClassName='active'
                    forcePage={pageForceSelected}
                />
            )
            }
        </>
    );
}

export default PaginatedItems;
