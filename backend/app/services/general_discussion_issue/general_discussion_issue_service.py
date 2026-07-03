from app.repositories.general_discussion_issue_repository import GeneralDiscussionIssueRepository

class GeneralDiscussionIssueService:

    @staticmethod
    def create(db, data):
        if not data.get("title"):
            raise Exception("Title is required")

        return GeneralDiscussionIssueRepository.create(db, data)

    @staticmethod
    def update(db, db_obj, data):
        return GeneralDiscussionIssueRepository.update(db, db_obj, data)

    @staticmethod
    def deactivate(db, db_obj):
        return GeneralDiscussionIssueRepository.deactivate(db, db_obj)

    @staticmethod
    def restore(db, db_obj):
        return GeneralDiscussionIssueRepository.restore(db, db_obj)

    @staticmethod
    def delete(db, db_obj):
        return GeneralDiscussionIssueRepository.delete(db, db_obj)