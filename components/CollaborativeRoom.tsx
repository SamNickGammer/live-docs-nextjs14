'use client'

import {ClientSideSuspense, RoomProvider} from "@liveblocks/react/suspense";
import Header from "@/components/Header";
import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs";
import {Editor} from "@/components/editor/Editor";
import ActiveCollaborators from "@/components/ActiveCollaborators";
import React, {useEffect, useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import {updateDocument} from "@/lib/actions/room.actions";
import Loader from "@/components/Loader";

export default function CollaborativeRoom({roomId, roomMetadata}: CollaborativeRoomProps) {
    const currentUserType = 'editor'
    const [documentTitle, setDocumentTitle] = useState(roomMetadata.title)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter'){
            setLoading(true)
            try {
                if(documentTitle !== roomMetadata.title){
                    const updatedDocument = await updateDocument(roomId, documentTitle);
                    if(updatedDocument){
                        setEditing(false)
                    }
                }
            }catch (error){
                console.log(error)
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(containerRef.current && !containerRef.current.contains(e.target as Node)){
                setEditing(false)
                console.log("running this")
                updateDocument(roomId, documentTitle)
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [roomId,documentTitle]);

    useEffect(() => {
        if(editing && inputRef.current){
            inputRef.current.focus()
        }
    }, [editing]);

    return (
        <RoomProvider id={roomId}>
            <ClientSideSuspense fallback={<Loader/>}>
                <div className='collaborative-room'>
                    <Header>
                        <div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
                            {/*<p className="document_title">Share</p>*/}
                            {editing && !loading ? (
                                <Input
                                    type='text'
                                    value={documentTitle}
                                    ref={inputRef}
                                    placeholder={"Enter Title"}
                                    onChange={(e) => setDocumentTitle(e.target.value)}
                                    onKeyDown={updateTitleHandler}
                                    disabled={!editing}
                                    className={'document-title-input'}
                                />
                            ): (
                                <>
                                    <p className='document-title'>{documentTitle}</p>
                                </>
                            )}
                            {currentUserType === 'editor' && !editing && (
                                <Image
                                    src='/assets/icons/edit.svg'
                                    alt='edit'
                                    width={24}
                                    height={24}
                                    className={'pointer'}
                                    onClick={()=>setEditing(true)}
                                />
                            )}
                            {currentUserType !== 'editor' && !editing && (
                                <p className='view-only-tag'>View Only</p>
                            )}

                            {loading && <p className='text-sm text-gray-400'>Saving...</p>}

                        </div>
                        <div className='flex w-full flex-1 justify-end gap-2 sm:gap-3'>
                            <ActiveCollaborators/>
                            <SignedOut>
                                <SignInButton />
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </Header>
                    <Editor/>
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    )
}