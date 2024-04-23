import { Injectable, Inject } from '@nestjs/common';
import { Database, aql } from 'arangojs';

@Injectable()
export class PredicateService {

    constructor(@Inject('ARANGODB') private db: Database) { }

    async addPredicate(predicate: any): Promise<any> {

        const myCollection = this.db.collection('property');

        // 插入数据
        const document = {
            _key: predicate.id,
            id: predicate.id,
            name: predicate.name,
            enName: predicate.enName,
            description: predicate.description,
            enDescription: predicate.enDescription,
            head: predicate.head,
            tail: predicate.tail,
            modified: new Date().toISOString(),
        };

        return myCollection.save(document).then(
            (doc) => console.log('Document saved:', doc),
            (err) => console.error('Failed to save document:', err),
        );
    }


    async updatePredicate(predicate: any): Promise<any> {

        // Fetch the existing document
        const myCollection = this.db.collection('property');

        return myCollection
            .document(predicate.id)
            .then((existingDocument) => {
                // Update the document fields
                existingDocument.name = predicate.name;
                existingDocument.enName = predicate.enName;
                existingDocument.description = predicate.description;
                existingDocument.enDescription = predicate.enDescription;
                existingDocument.head = predicate.head;
                existingDocument.tail = predicate.tail;
                existingDocument.modified = new Date().toISOString();
                return myCollection.update(existingDocument._key, existingDocument);
            })
            .then(
                (updatedDocument) => console.log('Document updated:', updatedDocument),
                (err) => console.error('Failed to update document:', err),
            );
    }
}