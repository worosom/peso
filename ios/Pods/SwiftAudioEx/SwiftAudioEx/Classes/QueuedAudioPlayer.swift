//
//  QueuedAudioPlayer.swift
//  SwiftAudio
//
//  Created by Jørgen Henrichsen on 24/03/2018.
//

import Foundation
import MediaPlayer

/**
 An audio player that can keep track of a queue of AudioItems.
 */
public class QueuedAudioPlayer: AudioPlayer, QueueManagerDelegate {
    
    let queueManager: QueueManager = QueueManager<AudioItem>()

    public override init(nowPlayingInfoController: NowPlayingInfoControllerProtocol = NowPlayingInfoController(), remoteCommandController: RemoteCommandController = RemoteCommandController()) {
        super.init(nowPlayingInfoController: nowPlayingInfoController, remoteCommandController: remoteCommandController)
        queueManager.delegate = self
    }

    /// The repeat mode for the queue player.
    public var repeatMode: RepeatMode = .off
    
    public override var currentItem: AudioItem? {
        return queueManager.current
    }
    
    /**
     The index of the current item.
     */
    public var currentIndex: Int {
        return queueManager.currentIndex
    }
    
     /**
     Stops the player and clears the queue.
     */
    public override func stop() {
        super.stop()
        self.event.queueIndex.emit(data: (currentIndex, nil))
    }
    
    override func reset() {
        super.reset()
        queueManager.clearQueue()
    }
    
    /**
     All items currently in the queue.
     */
    public var items: [AudioItem] {
        return queueManager.items
    }
    
    /**
     The previous items held by the queue.
     */
    public var previousItems: [AudioItem] {
        return queueManager.previousItems
    }
    
    /**
     The upcoming items in the queue.
     */
    public var nextItems: [AudioItem] {
        return queueManager.nextItems
    }
    
    /**
     Will replace the current item with a new one and load it into the player.
     
     - parameter item: The AudioItem to replace the current item.
     - throws: APError.LoadError
     */
    public override func load(item: AudioItem, playWhenReady: Bool) throws {
        try super.load(item: item, playWhenReady: playWhenReady)
        queueManager.replaceCurrentItem(with: item)
    }
    
    /**
     Add a single item to the queue.
     
     - parameter item: The item to add.
     - parameter playWhenReady: If the AudioPlayer has no item loaded, it will load the `item`. If this is `true` it will automatically start playback. Default is `true`.
     - throws: `APError`
     */
    public func add(item: AudioItem, playWhenReady: Bool = true) throws {
        if currentItem == nil {
            queueManager.addItem(item)
            try self.load(item: item, playWhenReady: playWhenReady)
        }
        else {
            queueManager.addItem(item)
        }
    }
    
    /**
     Add items to the queue.
     
     - parameter items: The items to add to the queue.
     - parameter playWhenReady: If the AudioPlayer has no item loaded, it will load the first item in the list. If this is `true` it will automatically start playback. Default is `true`.
     - throws: `APError`
     */
    public func add(items: [AudioItem], playWhenReady: Bool = true) throws {
        if currentItem == nil {
            queueManager.addItems(items)
            try self.load(item: currentItem!, playWhenReady: playWhenReady)
        }
        else {
            queueManager.addItems(items)
        }
    }
    
    public func add(items: [AudioItem], at index: Int) throws {
        try queueManager.addItems(items, at: index)
    }
    
    /**
     Step to the next item in the queue.
     
     - throws: `APError`
     */
    public func next() throws {
        do {
            let nextItem = try queueManager.next()
            event.playbackEnd.emit(data: .skippedToNext)
            try self.load(item: nextItem, playWhenReady: repeatMode != .track)
        } catch APError.QueueError.noNextItem  {
            if repeatMode == .queue {
                event.playbackEnd.emit(data: .skippedToNext)
                try jumpToItem(atIndex: 0, playWhenReady: true)
            } else {
                throw APError.QueueError.noNextItem
            }
        } catch {
            throw error
        }
    }
    
    /**
     Step to the previous item in the queue.
     */
    public func previous() throws {
        let previousItem = try queueManager.previous()
        event.playbackEnd.emit(data: .skippedToPrevious)
        try self.load(item: previousItem, playWhenReady: repeatMode != .track)
    }
    
    /**
     Remove an item from the queue.
     
     - parameter index: The index of the item to remove.
     - throws: `APError.QueueError`
     */
    public func removeItem(at index: Int) throws {
        try queueManager.removeItem(at: index)
    }
    
    /**
     Jump to a certain item in the queue.
     
     - parameter index: The index of the item to jump to.
     - parameter playWhenReady: Wether the item should start playing when ready. Default is `true`.
     - throws: `APError`
     */
    public func jumpToItem(atIndex index: Int, playWhenReady: Bool = true) throws {
        let item = try queueManager.jump(to: index)
        event.playbackEnd.emit(data: .jumpedToIndex)
        try self.load(item: item, playWhenReady: playWhenReady)
    }
    
    /**
     Move an item in the queue from one position to another.
     
     - parameter fromIndex: The index of the item to move.
     - parameter toIndex: The index to move the item to.
     - throws: `APError.QueueError`
     */
    public func moveItem(fromIndex: Int, toIndex: Int) throws {
        try queueManager.moveItem(fromIndex: fromIndex, toIndex: toIndex)
    }
    
    /**
     Remove all upcoming items, those returned by `next()`
     */
    public func removeUpcomingItems() {
        queueManager.removeUpcomingItems()
    }
    
    /**
     Remove all previous items, those returned by `previous()`
     */
    public func removePreviousItems() {
        queueManager.removePreviousItems()
    }
    
    // MARK: - AVPlayerWrapperDelegate
    
    override func AVWrapperItemDidPlayToEndTime() {
        super.AVWrapperItemDidPlayToEndTime()

        switch repeatMode {
        case .off:
            do {
                let nextItem = try queueManager.next()
                try self.load(item: nextItem, playWhenReady: repeatMode != .track)
            } catch { /* playback finished */ }
        case .track:
            seek(to: 0)
            play()
        case .queue:
            do {
                let nextItem = try queueManager.next()
                try self.load(item: nextItem, playWhenReady: repeatMode != .track)
            } catch {
                try? jumpToItem(atIndex: 0, playWhenReady: true)
            }
        }
    }

    // MARK: - QueueManagerDelegate

    func onCurrentIndexChanged(oldIndex: Int, newIndex: Int) {
        // if _currentItem is nil, then this was triggered by a reset. ignore.
        if _currentItem == nil { return }
        self.event.queueIndex.emit(data: (oldIndex, newIndex))
    }

    func onReceivedFirstItem() {
        self.event.queueIndex.emit(data: (nil, 0))
    }
}
